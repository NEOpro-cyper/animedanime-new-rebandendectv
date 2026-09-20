import { buildMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";

// ─── SEO: dynamic metadata per community thread ───
// Fetches the thread title from the database (server-side) so every
// thread gets its own <title>/OG tags. Falls back gracefully.
async function getThreadTitle(threadId) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { title: true, isHidden: true, category: true },
    });
    return thread;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { threadId } = await params;
  const thread = await getThreadTitle(threadId);

  if (!thread?.title) {
    return buildMetadata({
      title: "Community Thread",
      description: "Read and join this hentai discussion thread on YourHentaiTV.",
      path: `/community/${threadId}`,
    });
  }

  return buildMetadata({
    title: `${thread.title} — Community Thread`,
    description: `Read and reply to “${thread.title}” in the YourHentaiTV community${thread.category ? ` (${thread.category})` : ""}. Join the discussion with other hentai fans.`,
    path: `/community/${threadId}`,
    keywords: [thread.title.toLowerCase(), "hentai discussion", "community thread"],
    noindex: Boolean(thread.isHidden),
  });
}

export default function ThreadLayout({ children }) {
  return children;
}
