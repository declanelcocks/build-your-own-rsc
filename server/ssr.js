import { createServer } from "http"
import { renderToString } from "react-dom/server"
import getStaticAsset from "./getStaticAsset.js"
import readForm from "./readForm.js"
import * as http from 'node:http'
import express from 'express';
import compress from 'compression';
import { renderToPipeableStream } from "react-dom/server"
import { createFromNodeStream } from 'react-server-dom-webpack/client';

const app = express();

app.use(compress());
app.use(express.static('static'));

app.all("*", async function (req, res, next) {
  // Forwards the request to the RSC server to pipe a React
  // tree to the request
  const promiseForData = request(
    {
      host: "127.0.0.1",
      port: 3001,
      method: req.method,
      path: req.path,
      headers: req.headers,
    },
    req
  )

  // Check if the user is asking for some HTML
  // There are no HTML files in this project, so if the user wants HTML
  // we need to establish a stream to stream a React tree to the client
  if (req.accepts("text/html")) {
    try {
      const rscResponse = await promiseForData
      const root = await createFromNodeStream(rscResponse)

      res.set("Content-type", "text/html")
      const { pipe } = renderToPipeableStream(root)
      pipe(res)
    } catch (e) {
      console.error(`Failed to SSR: ${e.stack}`)
      res.statusCode = 500
      res.end()
    }
  } else {
    try {
      const rscResponse = await promiseForData

      // RSC header convention
      res.set("Content-type", "text/x-component")

      // After setting the header, everything is straightforward. Just
      // pipe the data to the response.
      rscResponse.on("data", (data) => {
        res.write(data)
        res.flush()
      })
      rscResponse.on("end", (data) => {
        res.end()
      })
    } catch (e) {
      console.error(`Failed to proxy request: ${e.stack}`)
      res.statusCode = 500
      res.end()
    }
  }
})

app.listen(3000, () => {
  console.log("Global Fizz/Webpack Server listening on port 3000...")
})

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      resolve(res)
    })
    req.on("error", (e) => {
      reject(e)
    })
    body.pipe(req)
  })
}

// createServer(async (req, res) => {
//   try {
//     const url = new URL(req.url, `http://${req.headers.host}`)
//     if (url.pathname.includes(".")) {
//       await getStaticAsset(url.pathname, res)
//       return
//     }
//     if (url.pathname.startsWith("/api/")) {
//       await serveAction(req, res)
//       return
//     }
//     const response = await fetch("http://127.0.0.1:8081" + url.pathname)

//     if (!response.ok) {
//       errorResponse(res, response)
//       return
//     }
//     const clientJSXString = await response.text()
//     if (url.searchParams.has("jsx")) {
//       res.setHeader("Content-Type", "application/json")
//       res.end(clientJSXString)
//     } else {
//       const clientJSX = JSON.parse(clientJSXString, parseJSX)
//       let html = renderToString(clientJSX)
//       html += `<script>window.__INITIAL_CLIENT_JSX_STRING__ = `
//       html += JSON.stringify(clientJSXString).replace(/</g, "\\u003c")
//       html += `</script>`
//       html += `
//         <script type="importmap">
//           {
//             "imports": {
//               "react": "https://esm.sh/react@canary",
//               "react-dom/client": "https://esm.sh/react-dom@canary/client"
//             }
//           }
//         </script>
//         <script type="module" src="/client.js"></script>
//       `
//       res.setHeader("Content-Type", "text/html")
//       res.end(html)
//     }
//   } catch (err) {
//     console.log("error in ssr.js", err)
//     res.statusCode = 500
//     res.end()
//   }
// }).listen(8080)

// function parseJSX(key, value) {
//   if (value === "$RE") {
//     return Symbol.for("react.element")
//   } else if (typeof value === "string" && value.startsWith("$$")) {
//     return value.slice(1)
//   } else {
//     return value
//   }
// }

// async function serveAction(req, res) {
//   console.log("serveAction", req.url)
//   let rawBody
//   try {
//     rawBody = await readForm(req)
//   } catch (err) {
//     console.log("error in readForm", err)
//   }
//   const body = JSON.stringify(rawBody)

//   const url = new URL(req.url, `http://${req.headers.host}`)
//   const fetchURL =
//     "http://127.0.0.1:8081" +
//     url.pathname +
//     (url.searchParams.toString() ? "?" + url.searchParams.toString() : "")

//   const response = await fetch(fetchURL, {
//     method: "POST",
//     body,
//   })

//   if (!response.ok) {
//     errorResponse(res, response)
//   }

//   const bodyString = await response.text()
//   const headers = response.headers
//   console.log("headers before", res.getHeaders())
//   writeHeaders(headers, res)
//   console.log("headers after", res.getHeaders())
//   console.log("cookies", headers.get("set-cookie"))
//   res.end(bodyString)
// }

// function writeHeaders(headers, res) {
//   try {
//     for (const [key, value] of headers.entries()) {
//       console.log("writeHeaders", key, value)
//       res.setHeader(key, value)
//     }
//   } catch (err) {
//     console.log("error in writeHeaders", err)
//   }
// }

// function errorResponse(res, RSCResponse) {
//   console.log("response not ok in ssr.js", RSCResponse.status)
//   res.statusCode = RSCResponse.status ?? 500
//   res.statusMessage = RSCResponse.statusText ?? "Server error"
//   res.end()
// }