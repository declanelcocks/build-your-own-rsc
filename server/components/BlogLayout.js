import ColorChanger from './ColorChanger.js';
import PopularPosts from './PopularPosts.js';
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
          <PopularPosts />
        </nav>

        <main>{children}</main>

        <Footer author={author} />
      </body>
    </html>
  );
}