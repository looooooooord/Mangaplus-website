import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { RequireAccount } from '@/components/RequireAccount';
import { RouteSkeleton } from '@/components/Skeleton';
import { ScrollToTop } from '@/components/ScrollToTop';

const Home = lazy(() => import('@/pages/Home'));
const Explore = lazy(() => import('@/pages/Explore'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const WorkDetails = lazy(() => import('@/pages/WorkDetails'));
const MangaReader = lazy(() => import('@/pages/MangaReader'));
const NovelReader = lazy(() => import('@/pages/NovelReader'));
const Library = lazy(() => import('@/pages/Library'));
const Account = lazy(() => import('@/pages/Account'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const AuthAction = lazy(() => import('@/pages/AuthAction'));
const About = lazy(() => import('@/pages/About'));
const Features = lazy(() => import('@/pages/Features'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Contact = lazy(() => import('@/pages/Contact'));
const Download = lazy(() => import('@/pages/Download'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <LibraryProvider>
                <ScrollToTop />
                <ErrorBoundary>
                  <Suspense fallback={<RouteSkeleton />}>
                    <Routes>
                      <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="explore" element={<Explore />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="manga/:id" element={<WorkDetails type="manga" />} />
                        <Route path="novel/:id" element={<WorkDetails type="novel" />} />
                        <Route path="library" element={<Library />} />
                        <Route
                          path="account"
                          element={
                            <RequireAccount>
                              <Account />
                            </RequireAccount>
                          }
                        />
                        <Route path="login" element={<Login />} />
                        <Route path="signup" element={<Signup />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="auth-action" element={<AuthAction />} />
                        <Route path="about" element={<About />} />
                        <Route path="features" element={<Features />} />
                        <Route path="faq" element={<FAQPage />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="download" element={<Download />} />
                        <Route path="error" element={<ErrorPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      <Route path="reader/manga/:id/:chapterId" element={<MangaReader />} />
                      <Route path="reader/novel/:id/:chapterId" element={<NovelReader />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </LibraryProvider>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
