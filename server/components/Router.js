import sanitizeFilename from "sanitize-filename";
import BlogIndexPage from './BlogIndexPage.js'
import BlogPostPage from './BlogPostPage.js'
import BlogLayout from './BlogLayout.js'
import { handlePostClick } from "./PopularPosts.js";

export default async function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndexPage />
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1))
    await handlePostClick(postSlug);
    // even though BlogPostPage is rendered on the server, we still
    // need to give React a key so that it considers 2 posts to be
    // 2 unique BlogPostPage components rather than the same one.
    page = (
      <article key={postSlug}>
        <BlogPostPage postSlug={postSlug} />
      </article>
    )
  }
  return <BlogLayout>{page}</BlogLayout>
}