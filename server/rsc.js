import { createServer } from "http";
import Router from './components/Router.js';
import ActionRouter from './components/ActionRouter.js';
import { Fragment } from 'react';
import React from 'react';
import express from 'express';
import compress from 'compression';
import { renderToPipeableStream } from "react-server-dom-webpack/server.node";

// Server that takes a URL path and pipes React components back to it
// - Takes the requested URL
// - Creates a React element using our Router component and the URL
// - renderToPipeableStream renders a React tree to a pipeable Node.js Stream
// - On the client, hydrateRoot is called to make the server-generated HTML
//   interactive
// - Streaming allows users to start seeing content as it loads using Suspense
// -
const app = express();
app.use(compress());

async function renderApp(req, res) {
  const path = req.path
  const url = new URL(path, `http://${req.headers.host ?? `localhost:3000`}`)
  const root = React.createElement(Router, { url })

  // In renderToPipeableStream's options is where you'd add options for
  // onShellReady (the part of the app outside of any Suspense boundaries) and
  // onAllReady. These options would be useful for telling web crawlers (for SEO)
  // to wait for onAllReady before returning the HTML rather than incrementally
  // loading the page.
  const { pipe } = renderToPipeableStream(root)

  pipe(res)
}

// https://github.com/reactjs/server-components-demo/blob/main/server/api.server.js
// In React's example of RSC's, they put everything under one server and use
// "/react" as the endpoint to get react components. This repo followed on from
// Dan Abramov's example of RSC's from scratch, so we're using 2 servers.
app.get("*", async function (req, res) {
  await renderApp(req, res, null)
})

app.listen(3001, () => {
  console.log("Flight Server listening on port 3001...")
})

// // This is a server to host data-local resources like databases and RSC.
// createServer(async (req, res) => {
//   try {
//     const url = new URL(req.url, `http://${req.headers.host}`)
//     if (url.pathname.startsWith("/api/")) {
//       // const action = url.searchParams.get("action")
//       const action = url.pathname.slice(5)
//       await ActionRouter(action, req, res)
//       return
//     }
//     await sendJSX(res, <Router url={url} />)
//   } catch (err) {
//     console.error(err)
//     res.statusCode = err.statusCode ?? 500
//     res.end()
//   }
// }).listen(8081)

// async function sendJSX(res, jsx) {
//   const clientJSX = await renderJSXToClientJSX(jsx)
//   const clientJSXString = JSON.stringify(clientJSX, stringifyJSX)
//   res.setHeader("Content-Type", "application/json")
//   res.end(clientJSXString)
// }

// function stringifyJSX(key, value) {
//   if (value === Symbol.for("react.element")) {
//     return "$RE"
//   } else if (typeof value === "string" && value.startsWith("$")) {
//     return "$" + value
//   } else {
//     return value
//   }
// }

// async function renderJSXToClientJSX(jsx) {
//   if (
//     typeof jsx === "string" ||
//     typeof jsx === "number" ||
//     typeof jsx === "boolean" ||
//     jsx == null
//   ) {
//     return jsx
//   } else if (Array.isArray(jsx)) {
//     return Promise.all(jsx.map((child) => renderJSXToClientJSX(child)))
//   } else if (jsx != null && typeof jsx === "object") {
//     if (jsx.$$typeof === Symbol.for("react.element")) {
//       if (jsx.type === Fragment) {
//         const { children } = jsx.props
//         return await renderJSXToClientJSX(children)
//       } else if (typeof jsx.type === "string") {
//         return {
//           ...jsx,
//           props: await renderJSXToClientJSX(jsx.props),
//         }
//       } else if (typeof jsx.type === "function") {
//         const Component = jsx.type
//         const props = jsx.props
//         const returnedJsx = await Component(props)
//         return renderJSXToClientJSX(returnedJsx)
//       } else throw new Error("Not implemented.")
//     } else {
//       return Object.fromEntries(
//         await Promise.all(
//           Object.entries(jsx).map(async ([propName, value]) => [
//             propName,
//             await renderJSXToClientJSX(value),
//           ])
//         )
//       )
//     }
//   } else throw new Error("Not implemented")
// }