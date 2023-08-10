import { Suspense } from "react"

const url = "http://localhost:3000/api/streaming"

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function StreamingPage() {
  const streamData = await fetch(url, {
    headers: {
      Accept: "text/plain",
    },
  })

  const data = sleep(2500).then(() => streamData.text())

  return (
    <>
      <h1>Streaming!!!</h1>
      <Suspense fallback={<p>Loading Two, Electric Boogaloo!</p>}>
        <p>{data}</p>
      </Suspense>
    </>
  )
}