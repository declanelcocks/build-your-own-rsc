import Post from './Post.js';
import CommentForm from './CommentForm.js';
import CommentList from './CommentList.js';

export default function BlogPostPage({ postSlug }) {
  return (
    <>
      <Post slug={postSlug} />
      <CommentForm slug={postSlug} />
      <CommentList slug={postSlug} />
    </>
  );
}