import { createServer } from "http";
import { readFile } from "fs/promises";
import { renderToString } from "react-dom/server";
import getStaticAsset from './getStaticAsset.js';

// This is a server to host CDN distributed resources like static files and SSR.

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // A bit hacky but this now acts as a go-to for any path that has a `.`
    // in it. That would generally be files (e.g. 'client.js') or other
    // asset imports. Any other URL, such as a page, wouldn't include
    // any dots in it
    if (url.pathname.includes('.')) {
      await getStaticAsset(url.pathname, res);
      return;
    }

    const response = await fetch("http://127.0.0.1:8081" + url.pathname);
    if (!response.ok) {
      res.statusCode = response.status;
      res.end();
      return;
    }

    const clientJSXString = await response.text();
    if (url.searchParams.has("jsx")) {
      res.setHeader("Content-Type", "application/json");
      res.end(clientJSXString);
    } else {
      const clientJSX = JSON.parse(clientJSXString, parseJSX);
      let html = renderToString(clientJSX);
      html += `<script>window.__INITIAL_CLIENT_JSX_STRING__ = `;
      html += JSON.stringify(clientJSXString).replace(/</g, "\\u003c");
      html += `</script>`;
      html += `
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@canary",
              "react-dom/client": "https://esm.sh/react-dom@canary/client"
            }
          }
        </script>
        <script type="module" src="/client.js"></script>
      `;
      res.setHeader("Content-Type", "text/html");
      res.end(html);
    }
  } catch (err) {
    console.error(err);
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(8080);

function parseJSX(key, value) {
  if (value === "$RE") {
    return Symbol.for("react.element");
  } else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1);
  } else {
    return value;
  }
}
