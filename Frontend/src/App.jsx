import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Result from './pages/Result';
import DigitalTwin from './pages/DigitalTwin';
import PublicTwinChat from './pages/PublicTwinChat';
import ResumeBuilder from './pages/ResumeBuilder';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}
    >
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/studio"
          element={
            <PageTransition>
              <Result />
            </PageTransition>
          }
        />
        <Route
          path="/result"
          element={
            <PageTransition>
              <Result />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <PageTransition>
              <HowItWorks />
            </PageTransition>
          }
        />
        <Route
          path="/digital-twin"
          element={
            <PageTransition>
              <DigitalTwin />
            </PageTransition>
          }
        />
        <Route
          path="/digital-twin/:slug/resume-builder"
          element={
            <PageTransition>
              <ResumeBuilder />
            </PageTransition>
          }
        />
        <Route
          path="/resume-builder/:slug"
          element={
            <PageTransition>
              <ResumeBuilder />
            </PageTransition>
          }
        />
        <Route
          path="/twin/:slug"
          element={
            <PageTransition className="h-[100dvh] flex flex-col">
              <PublicTwinChat />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-[#F3EFE9] dark:bg-[#0F172A] text-[#1D2B3A] dark:text-gray-100 flex flex-col font-sans transition-colors">
            <AnimatedRoutes />
          </div>
          <ToastContainer />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
