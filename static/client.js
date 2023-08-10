import { hydrateRoot } from "react-dom/client"
import colorChanger from "./color-changer.js"

import React, { use, useState, startTransition } from 'react';
import ReactDOM from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack';

let updateRoot
let JSXCache = new Map()

function Shell({ data }) {
  console.log("Shell", data)
  // Experimental "use" hook allows you to use async data on
  // the client side
  const [root, setRoot] = useState(use(data))
  updateRoot = setRoot
  JSXCache.set(currentPath, root)
  return root
}

let currentPath = window.location.pathname
// createFromFetch creates a React tree from a fetch
// x-component header tells the server we want a React tree
let data = createFromFetch(
  fetch(currentPath, {
    headers: {
      Accept: "text/x-component",
    },
  })
)

async function navigate() {
  const response = fetch(currentPath, {
    headers: {
      Accept: "text/x-component",
    },
  })
  const root = await createFromFetch(response)
  startTransition(() => {
    updateRoot(root)
  })
}

window.navigation.addEventListener("navigate", (event) => {
  if (!event.canIntercept) return
  const path = new URL(event.destination.url).pathname
  currentPath = path
  if (event.navigationType === "traverse") {
    if (JSXCache.has(path)) {
      console.log("cache hit", path)
      event.intercept({ handler: () => updateRoot(JSXCache.get(path)) })
      return
    }
  }

  event.intercept({ handler: () => navigate(event) })
})

ReactDOM.hydrateRoot(document, React.createElement(Shell, { data }))

// const root = hydrateRoot(document, getInitialClientJSX())
// // sets pathname to the browser's pathname
// let currentPathname = window.location.pathname;

// let clientJsxCache = {}

// clientJsxCache[currentPathname] = getInitialClientJSX();

// async function navigate(pathname, options) {
//   let { cache } = options ?? { cache: false }

//   currentPathname = pathname;

//   if (cache && clientJsxCache[pathname]) {
//     console.log('cache hit', pathname)
//     root.render(clientJsxCache[pathname]);
//     return;
//   } else {
//     console.log('cache miss', pathname)
//     const clientJSX = await fetchClientJSX(pathname)
//     clientJsxCache[pathname] = clientJSX;

//     if (pathname === currentPathname) {
//       root.render(clientJSX)
//     }
//   }

//   await colorChanger()
// }

// function getInitialClientJSX() {
//   const clientJSX = JSON.parse(window.__INITIAL_CLIENT_JSX_STRING__, parseJSX)
//   return clientJSX
// }

// async function fetchClientJSX(pathname) {
//   const response = await fetch(pathname + "?jsx")
//   const clientJSXString = await response.text()
//   const clientJSX = JSON.parse(clientJSXString, parseJSX)
//   return clientJSX
// }

// function parseJSX(key, value) {
//   if (value === "$RE") {
//     return Symbol.for("react.element")
//   } else if (typeof value === "string" && value.startsWith("$$")) {
//     return value.slice(1)
//   } else {
//     return value
//   }
// }

// window.addEventListener(
//   "click",
//   (e) => {
//     if (e.target.tagName !== "A") {
//       return
//     }
//     if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
//       return
//     }
//     const href = e.target.getAttribute("href")
//     if (!href.startsWith("/")) {
//       return
//     }
//     e.preventDefault()
//     window.history.pushState(null, null, href)
//     navigate(href)
//   },
//   true
// )

// window.addEventListener("popstate", () => {
//   navigate(window.location.pathname, { cache: true })
// })

// window.addEventListener("submit", async (e) => {
//   const action = e.target.action
//   const actionURL = new URL(action, `http://${window.location.host}`)

//   if (!actionURL.pathname.startsWith("/api/")) {
//     console.log("not an API call")
//     return
//   }

//   e.preventDefault()

//   try {
//     if (e.target.method === "get") {
//       const formData = new FormData(e.target)
//       const queryParams = new URLSearchParams(formData)
//       const url = action + "?" + queryParams.toString()
//       const response = await fetch(url)
//       const location = response.headers.get("Location")
//       if (location) {
//         window.history.pushState(null, null, location)
//         navigate(location)
//       } else {
//         navigate(window.location.pathname)
//       }
//       return
//     } else if (e.target.method === "post") {
//       const formData = new FormData(e.target)
//       const body = Object.fromEntries(formData.entries())
//       const url = action
//       const response = await fetch(url, {
//         method: "POST",
//         body: JSON.stringify(body),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//       response.headers.forEach((value, key) => {
//         console.log(key, value)
//       })
//       const location = response.headers.get("Location")
//       if (location) {
//         window.history.pushState(null, null, location)
//         navigate(location)
//       } else {
//         navigate(window.location.pathname)
//       }
//       return
//     } else {
//       console.error("unknown method", e.target.method)
//     }
//   } catch (err) {
//     console.error(err)
//   }
// })

// await colorChanger()