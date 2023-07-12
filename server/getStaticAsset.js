import { readFile } from 'fs/promises'

// This function will now take care of taking the pathname
// and fetching that file. It will also set the response headers
// according to the file it fetched.
export default async function getStaticAsset(pathname, res) {
  const ext = pathname.slice(pathname.lastIndexOf('.'))
  let contentType = ''

  switch (ext) {
    case '.js':
      contentType = 'application/javascript'
      break
    case '.css':
      contentType = 'text/css'
      break
    case '.html':
      contentType = 'text/html'
      break
    case '.json':
      contentType = 'application/json'
      break
    case '.png':
      contentType = 'image/png'
      break
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg'
      break
    case '.svg':
      contentType = 'image/svg+xml'
      break
    case '.gif':
      contentType = 'image/gif'
      break
    case '.txt':
      contentType = 'text/plain'
      break
    case '.pdf':
      contentType = 'application/pdf'
      break
    case '.ico':
      contentType = 'image/x-icon'
      break

    default:
      throw new Error(`unsupported file type: ${pathname}`)
  }

  try {
    const content = await readFile(`./static/${pathname}`)
    res.setHeader('Content-Type', contentType)
    res.end(content)
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end('Server error')
  }
}