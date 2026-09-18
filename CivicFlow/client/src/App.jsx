import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ReportIssueModal from './components/ReportIssueModal';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ExploreIssues from './pages/ExploreIssues';
import IssueDetailPage from './pages/IssueDetailPage';
import MapView from './pages/MapView';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-400">Loading session...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin' && user.role !== 'operator') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleOpenAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Navbar
            onOpenAuth={handleOpenAuth}
            onOpenReport={() => setReportModalOpen(true)}
          />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage onOpenAuth={handleOpenAuth} onOpenReport={() => setReportModalOpen(true)} />} />
              <Route path="/issues" element={<ExploreIssues />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/dashboard" element={<ProtectedRoute><CitizenDashboard onOpenReport={() => setReportModalOpen(true)} /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          <AuthModal
            isOpen={authModalOpen}
            initialMode={authInitialMode}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={() => {}}
          />

          <ReportIssueModal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}
