import Post from './Post.js';

export default function BlogPostPage({ postSlug }) {
  return <Post slug={postSlug} />;
}