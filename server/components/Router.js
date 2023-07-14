import sanitizeFilename from "sanitize-filename";
import BlogIndexPage from './BlogIndexPage.js'
import BlogPostPage from './BlogPostPage.js'
import BlogLayout from './BlogLayout.js'

export default function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndexPage />
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1))
    page = <BlogPostPage postSlug={postSlug} />
  }
  return <BlogLayout>{page}</BlogLayout>
}