import sanitizeFilename from "sanitize-filename";
import BlogIndexPage from './BlogIndexPage.js'
import BlogPostPage from './BlogPostPage.js'
import BlogLayout from './BlogLayout.js'
import Streaming from './Streaming.js'
import { handlePostClick } from "./PopularPosts.js";
import React from 'react';

export default async function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndexPage />
  } else if (url.pathname === "/streaming") {
    page = (
      <React.Suspense fallback={<p>Loading...</p>}>
        <Streaming />
      </React.Suspense>
    )
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1))
    await handlePostClick(postSlug)
    page = (
      <article key={postSlug}>
        <BlogPostPage postSlug={postSlug} />
      </article>
    )
  }
  return <BlogLayout>{page}</BlogLayout>
}