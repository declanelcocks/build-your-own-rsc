export default function ColorChanger() {
  return (
    <>
      <form action="/api/random" method="POST">
        <button type="submit">Random color</button>
      </form>
      <form action="/api/random?auto=true">
        <button type="submit">Random Color (no cookie)</button>
      </form>
    </>
  );
}