export default async function colorChanger(color) {
  if (color) {
    document.body.style.backgroundColor = color
    return
  }

  let colorCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("color="))

  if (colorCookie) {
    color = colorCookie.split("=")[1]
    colorChanger(color)
    return
  }

  const response = await fetch("/api/random?auto=true")

  if (!response.ok) {
    console.error(response)
    return
  }

  const { color: fetchedColor } = await response.json()

  document.body.style.backgroundColor = fetchedColor
}