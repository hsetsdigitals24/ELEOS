// components/blog/ArticleHtml.tsx — renders the rich-text article body of
// an API-fetched post. The HTML was sanitized on write (server-side
// allowlist, see server/src/services/post.service.ts), so rendering it
// directly is safe. Styling lives in globals.css under `.article-html`.

interface ArticleHtmlProps {
  html: string;
}

export default function ArticleHtml({ html }: ArticleHtmlProps) {
  return <div className="article-html" dangerouslySetInnerHTML={{ __html: html }} />;
}
