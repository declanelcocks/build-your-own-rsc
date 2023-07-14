import { readFile } from "fs/promises";
import Comment from './Comment.js';

export default async function CommentList({ slug }) {
  let comments
  try {
    const commentsData = await readFile("./comments/" + slug + ".json", "utf8")
    comments = JSON.parse(commentsData)
  } catch (err) {
    if (err.code === "ENOENT") {
      comments = []
    } else {
      throw err
    }
  }

  return (
    <div>
      <h2>Comments:</h2>
      {comments.map((comment, i) => (
        <Comment key={i} comment={comment} />
      ))}
    </div>
  )
}