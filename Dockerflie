# ─────────────────────────────────────────────────────────────
#  Coolify-optimized multi-stage Dockerfile for Next.js 16
#
#  Why your old installs were slow:
#   • No Dockerfile → Coolify used Nixpacks: no layer caching, so
#     node_modules (~400 MB with react-icons) was reinstalled and
#     Prisma engines (~50 MB) re-downloaded on EVERY deploy.
#   • `prisma generate` ran TWICE (postinstall + build script).
#
#  What this file does:
#   1. deps stage is cached — only re-runs when package*.json or
#      prisma/schema.prisma change. Redeploys of code-only changes
#      skip the whole npm ci.
#   2. Uses `output: "standalone"` (already set in next.config.mjs)
#      → final image ships ~40 MB of traced files instead of the
#      full node_modules tree.
#   3. Alpine base, non-root user, dumb-init for clean signals.
# ─────────────────────────────────────────────────────────────

# NOTE: Change these build args in Coolify → Settings → Build variables
#       (they are inlined into the client bundle at build time)
ARG NEXT_PUBLIC_API_URL="https://mainapi.nhembed.buzz"
ARG NEXT_PUBLIC_SITE_URL="https://yourhentaitv.com"

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init

# ─── deps: install node_modules + generate Prisma client (cached layer) ───
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ─── builder: compile the Next.js production build ───
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/lib/generated ./lib/generated
COPY . .
RUN npm run build

# ─── runner: minimal production image ───
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output contains the traced server + its node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# safety net: full Prisma client (incl. query engine) next to server.js
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated ./lib/generated

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-3000}/" || exit 1

CMD ["dumb-init", "node", "server.js"]
