import { readFile } from "fs/promises";
import Markdown from 'react-markdown';
import Image from './Image.js';

export default async function Post({ slug }) {
  let content;
  try {
    // Read `.md` files instead of plain text files so we can support
    // markdown rendering of the posts
    content = await readFile("./posts/" + slug + ".md", "utf8");
  } catch (err) {
    throwNotFound(err);
  }
  return (
    // Replace a <section></section> with a <></> since the section
    // was not actually doing anything
    <>
      <h2>
        <a href={"/" + slug}>{slug}</a>
      </h2>
      {/* Replace <article> with <Markdown> from react-markdown */}
      <Markdown
        components={{
          // we can now add a custom component to render when we receive
          // an img component. Remember that this is the server file, so
          // the library will read the file and its dimensions purely
          // on the server, the client won't know anything about it.
          img: Image,
        }}
      >
        {content}
      </Markdown>
    </>
  );
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause });
  notFound.statusCode = 404;
  throw notFound;
}