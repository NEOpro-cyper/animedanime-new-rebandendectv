/**
 * DB connection diagnostic route  ->  GET /api/db-test   (plain JavaScript)
 *
 * Stages: env -> parse -> dns -> tcp -> mysql (raw driver) -> prisma
 *
 * Optional query params:
 *   ?ssl=off   force-disable TLS
 *   ?ssl=on    force-enable TLS (accepts self-signed certs)
 *
 * SECURITY: passwords are redacted, but DELETE THIS FILE when you're done.
 * Requires:  npm i mysql2
 */
import net from "node:net";
import dns from "node:dns/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EXPECTED_TABLES = [
  "User",
  "Thread",
  "ThreadReply",
  "Comment",
  "CommentReply",
  "Notification",
  "WatchProgress",
  "Watchlist",
  "AdminReply",
];

const secrets = [];

function redact(text) {
  let out = text;
  for (const s of secrets) {
    if (s) out = out.split(s).join("***");
  }
  return out;
}

function hintFor(err) {
  const code = err && err.code;
  const msg = String((err && err.message) || "");

  switch (code) {
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return "Hostname does not resolve from Vercel. It is probably an INTERNAL Docker/Coolify hostname that Vercel cannot see. Use the server's public IP/domain and a publicly mapped port in DATABASE_URL.";
    case "ETIMEDOUT":
      return "Host resolved but the port is not reachable (firewall / port not published). Publish the DB port publicly in your hosting panel. Vercel uses dynamic IPs, so IP allow-listing will not work.";
    case "ECONNREFUSED":
      return "Server is reachable but nothing accepts connections on that port. Check the port number, that the DB is running, and that the port is mapped publicly.";
    case "ECONNRESET":
      return "Connection was reset. Often a TLS mismatch: try ?ssl=off (server has no SSL) or ?ssl=on (server requires SSL).";
    case "ER_ACCESS_DENIED_ERROR":
      return "Wrong username/password, or that user isn't allowed from this host (needs '%' host). Remember '@' in the password must be %40 in the URL.";
    case "ER_BAD_DB_ERROR":
      return "Login worked but the database name in the URL doesn't exist. See the 'list-databases' step for the names that do.";
    case "ER_HOST_NOT_PRIVILEGED":
    case "ER_HOST_IS_BLOCKED":
      return "The DB user isn't allowed from this remote host. Grant access for '%' or unblock the host.";
    case "HANDSHAKE_SSL_ERROR":
    case "DEPTH_ZERO_SELF_SIGNED_CERT":
    case "SELF_SIGNED_CERT_IN_CHAIN":
    case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
      return "TLS certificate problem. Add ?sslaccept=accept_invalid_certs to the URL (or call this route with ?ssl=on).";
    case "PROTOCOL_CONNECTION_LOST":
      return "Connection dropped during handshake. Try ?ssl=off / ?ssl=on.";
  }
  if (/ssl|tls/i.test(msg)) {
    return "Looks like a TLS/SSL problem. Try ?ssl=off, ?ssl=on, or add sslaccept=accept_invalid_certs.";
  }
  if (/must start with the protocol|provider/i.test(msg)) {
    return 'Prisma datasource provider does not match DATABASE_URL. In schema.prisma use provider = "mysql", then run `prisma generate`.';
  }
  if (/does not exist in the current database|doesn't exist/i.test(msg)) {
    return "Connected, but tables are missing. Import schema_mysql.sql into this exact database.";
  }
  return undefined;
}

async function run(step, fn) {
  const t = Date.now();
  try {
    const data = await fn();
    return { step, ok: true, ms: Date.now() - t, data };
  } catch (e) {
    return {
      step,
      ok: false,
      ms: Date.now() - t,
      error: {
        name: e && e.name,
        code: e && e.code,
        errno: e && e.errno,
        message: redact(String((e && e.message) || e)),
      },
      hint: hintFor(e),
    };
  }
}

function tcpCheck(host, port, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      const err = new Error(`TCP connect timed out after ${timeoutMs}ms`);
      err.code = "ETIMEDOUT";
      reject(err);
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      const remoteAddress = socket.remoteAddress;
      socket.destroy();
      resolve({ connected: true, remoteAddress });
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export async function GET(req) {
  const steps = [];
  const query = new URL(req.url).searchParams;
  const sslOverride = query.get("ssl"); // "on" | "off" | null

  // 1. env
  const raw = process.env.DATABASE_URL;
  steps.push(
    await run("env", async () => {
      if (!raw) throw new Error("DATABASE_URL is not set in this deployment's environment variables.");
      return {
        set: true,
        length: raw.length,
        startsWith: raw.split("://")[0] + "://",
        vercelRegion: process.env.VERCEL_REGION || "(not on Vercel)",
        node: process.version,
      };
    })
  );
  if (!steps[0].ok) return finish(steps);

  // 2. parse
  let host = "";
  let port = 3306;
  let user = "";
  let password = "";
  let database = "";
  let params = new URLSearchParams();

  steps.push(
    await run("parse", async () => {
      const authority = (raw.split("://")[1] || "").split("/")[0];
      const atCount = (authority.match(/@/g) || []).length;

      const u = new URL(raw);
      if (u.protocol !== "mysql:") {
        throw new Error(`DATABASE_URL protocol is "${u.protocol}" but must be "mysql:" for MariaDB/MySQL.`);
      }
      host = u.hostname;
      port = u.port ? Number(u.port) : 3306;
      user = decodeURIComponent(u.username);
      password = decodeURIComponent(u.password);
      database = decodeURIComponent(u.pathname.replace(/^\//, ""));
      params = u.searchParams;

      secrets.push(u.password, password, raw);

      return {
        host,
        port,
        user,
        database,
        passwordLength: password.length,
        params: Object.fromEntries(params.entries()),
        warning:
          atCount > 1
            ? `Found ${atCount} '@' characters before the host. Any '@' inside the password must be written as %40.`
            : undefined,
      };
    })
  );
  if (!steps[1].ok) return finish(steps);

  // 3. dns
  steps.push(
    await run("dns", async () => {
      if (net.isIP(host)) return { note: "Host is already an IP address", host };
      const addrs = await dns.lookup(host, { all: true });
      return { addresses: addrs };
    })
  );
  if (!steps[2].ok) return finish(steps);

  // 4. tcp
  steps.push(await run("tcp", () => tcpCheck(host, port)));
  if (!steps[3].ok) return finish(steps);

  // 5. mysql (raw driver)
  let ssl = undefined;
  if (sslOverride === "off") ssl = undefined;
  else if (sslOverride === "on") ssl = { rejectUnauthorized: false };
  else if (params.get("sslaccept") === "accept_invalid_certs") ssl = { rejectUnauthorized: false };
  else if (params.get("sslaccept") === "strict") ssl = {};

  const mysqlStep = await run("mysql", async () => {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl,
      connectTimeout: 8000,
    });
    try {
      const [v] = await conn.query("SELECT VERSION() AS version, DATABASE() AS db");
      const [t] = await conn.query("SHOW TABLES");
      const tables = t.map((row) => String(Object.values(row)[0]));
      const missing = EXPECTED_TABLES.filter((n) => !tables.includes(n));
      return {
        tlsUsed: !!ssl,
        serverVersion: v[0] && v[0].version,
        connectedDatabase: v[0] && v[0].db,
        tables,
        missingTables: missing,
        note: missing.length
          ? "Some tables are missing - import schema_mysql.sql into this database."
          : "All expected tables exist.",
      };
    } finally {
      await conn.end();
    }
  });
  steps.push(mysqlStep);

  if (!mysqlStep.ok && mysqlStep.error && mysqlStep.error.code === "ER_BAD_DB_ERROR") {
    steps.push(
      await run("list-databases", async () => {
        const mysql = await import("mysql2/promise");
        const conn = await mysql.createConnection({ host, port, user, password, ssl, connectTimeout: 8000 });
        try {
          const [rows] = await conn.query("SHOW DATABASES");
          return { databases: rows.map((r) => Object.values(r)[0]) };
        } finally {
          await conn.end();
        }
      })
    );
  }
  if (!mysqlStep.ok) return finish(steps);

  // 6. prisma  (file lives at app/api/db-test/route.js -> lib is 3 levels up)
  steps.push(
    await run("prisma", async () => {
      const mod = await import("../../../lib/generated/prisma");
      const prisma = new mod.PrismaClient();
      try {
        const userCount = await prisma.user.count();
        return { userCount };
      } finally {
        await prisma.$disconnect();
      }
    })
  );

  return finish(steps);
}

function finish(steps) {
  const failed = steps.find((s) => !s.ok);
  const body = {
    ok: !failed,
    summary: failed
      ? `FAILED at step "${failed.step}": ${(failed.error && (failed.error.code || failed.error.name)) || "error"} - ${failed.error && failed.error.message}`
      : "All steps passed. Database connection works.",
    hint: failed && failed.hint,
    steps,
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
