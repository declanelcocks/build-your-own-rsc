import { createServer } from "http";
import Router from './components/Router.js';
import ActionRouter from './components/ActionRouter.js';
import { Fragment } from 'react';

// This is a server to host data-local resources like databases and RSC.
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (url.pathname.startsWith("/api/")) {
      // const action = url.searchParams.get("action")
      const action = url.pathname.slice(5)
      await ActionRouter(action, req, res)
      return
    }
    await sendJSX(res, <Router url={url} />)
  } catch (err) {
    console.error(err)
    res.statusCode = err.statusCode ?? 500
    res.end()
  }
}).listen(8081)

async function sendJSX(res, jsx) {
  const clientJSX = await renderJSXToClientJSX(jsx)
  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX)
  res.setHeader("Content-Type", "application/json")
  res.end(clientJSXString)
}

function stringifyJSX(key, value) {
  if (value === Symbol.for("react.element")) {
    return "$RE"
  } else if (typeof value === "string" && value.startsWith("$")) {
    return "$" + value
  } else {
    return value
  }
}

async function renderJSXToClientJSX(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx
  } else if (Array.isArray(jsx)) {
    return Promise.all(jsx.map((child) => renderJSXToClientJSX(child)))
  } else if (jsx != null && typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (jsx.type === Fragment) {
        const { children } = jsx.props
        return await renderJSXToClientJSX(children)
      } else if (typeof jsx.type === "string") {
        return {
          ...jsx,
          props: await renderJSXToClientJSX(jsx.props),
        }
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type
        const props = jsx.props
        const returnedJsx = await Component(props)
        return renderJSXToClientJSX(returnedJsx)
      } else throw new Error("Not implemented.")
    } else {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, value]) => [
            propName,
            await renderJSXToClientJSX(value),
          ])
        )
      )
    }
  } else throw new Error("Not implemented")
}