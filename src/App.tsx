import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Claims } from './pages/Claims';
import { DuplicateDetection } from './pages/DuplicateDetection';
import { Anomalies } from './pages/Anomalies';
import { RiskRadar } from './pages/RiskRadar';
import { Verification } from './pages/Verification';
import { Investigation } from './pages/Investigation';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Landing Page at root */}
        <Route path="/" element={<LandingPage />} />

        {/* App Shell with Sidebar + Topbar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/duplicate-detection" element={<DuplicateDetection />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/risk-radar" element={<RiskRadar />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
