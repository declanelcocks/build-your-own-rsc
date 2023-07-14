import ColorChanger from './ColorChanger.js';
import Footer from './Footer.js'

export default function BlogLayout({ children }) {
  const author = "Jae Doe";
  return (
    <html>
      <body>
        <nav>
          <a href="/">Home</a>
          <hr />
          <ColorChanger />
          <hr />
        </nav>

        <main>{children}</main>

        <Footer author={author} />
      </body>
    </html>
  );
}