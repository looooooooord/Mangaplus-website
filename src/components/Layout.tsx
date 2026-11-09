import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        تجاوز إلى المحتوى الرئيسي
      </a>
      <Header />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
