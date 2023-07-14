export default function Comment({ comment }) {
  const { content, timestamp, author } = comment
  const parsedTimestamp = new Date(timestamp).toLocaleString()

  return (
    <>
      <p>{content}</p>
      <p>{author}</p>
      <p>Published: <span>{parsedTimestamp}</span></p>
    </>
  )
}