import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Result from './pages/Result';
import DigitalTwin from './pages/DigitalTwin';
import PublicTwinChat from './pages/PublicTwinChat';
import ResumeBuilder from './pages/ResumeBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Result />} />
        <Route path="/result" element={<Result />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/digital-twin/:slug/resume-builder" element={<ResumeBuilder />} />
        <Route path="/resume-builder/:slug" element={<ResumeBuilder />} />
        <Route path="/twin/:slug" element={<PublicTwinChat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
