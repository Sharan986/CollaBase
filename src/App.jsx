import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { DashboardNotificationProvider } from './contexts/DashboardNotificationContext';
import Layout from './layouts/Layout';
import ToastContainer from './components/ToastContainer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TeamsPage from './pages/TeamsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import CreateTeamPage from './pages/CreateTeamPage';
import ManageTeamsPage from './pages/ManageTeamsPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import FAQPage from './pages/FAQPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading, profileLoading } = useAuth();
  
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check if user profile exists and has required fields
  if (!userProfile || !userProfile.name || !userProfile.year || !userProfile.branch) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-team" 
            element={
              <ProtectedRoute>
                <CreateTeamPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-teams" 
            element={
              <ProtectedRoute>
                <ManageTeamsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team/:teamId" 
            element={
              <ProtectedRoute>
                <TeamDetailsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ApplicationProvider>
          <DashboardNotificationProvider>
            <AppRoutes />
            <ToastContainer />
          </DashboardNotificationProvider>
        </ApplicationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;