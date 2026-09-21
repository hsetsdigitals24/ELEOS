import NotFound from "@/components/updates/NotFound";

// app/not-found.tsx — the global custom 404. Every route that doesn't
// match (and any notFound() call outside the blog/video detail shells)
// renders this branded screen instead of Next's default error page.

export default function GlobalNotFound() {
  return <NotFound kind="page" backHref="/" backLabel="Back to Home" />;
}
