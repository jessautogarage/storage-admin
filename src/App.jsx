// App.jsx with enhancements
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextSafe';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ProtectedRouteDebug from './components/Auth/ProtectedRouteDebug';
import AdminLogin from './components/Auth/AdminLogin';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import UserManagement from './components/Users/UserManagement';
import ListingManagement from './components/Listings/ListingManagement';
import BookingManagement from './components/Bookings/BookingManagement';
import ChatSupport from './components/Chat/ChatSupport';
import Announcements from './components/Announcements/Announcements';
import Settings from './components/Settings/Settings';
import PaymentManagement from './components/Payments/PaymentManagement';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import LandingPage from './components/Landing/LandingPage';
import UserSignIn from './components/Auth/UserSignIn';
import UserSignUp from './components/Auth/UserSignUp';
import HostDashboard from './components/Dashboard/HostDashboard';
import ClientDashboard from './components/Dashboard/ClientDashboard';
import AuditLog from './components/Audit/AuditLog';
import DisputeCenter from './components/Disputes/DisputeCenter';
import NotificationCenter from './components/Notifications/NotificationCenter';
import PayoutManagement from './components/Payments/PayoutManagement';
import ReviewManagement from './components/Reviews/ReviewManagement';
import VerificationCenter from './components/Verification/VerificationCenter';
import AddListing from './components/Host/AddListing';
import Listings from './components/Host/Listings';
import Bookings from './components/Host/Bookings';
import Analytics from './components/Host/Analytics';
import Messages from './components/Host/Messages';
import Profile from './components/Host/Profile';
import HostSettings from './components/Host/Settings';
import Browse from './components/Client/Browse';
import MapView from './components/Client/MapView';
import ClientBookings from './components/Client/Bookings';
import Favorites from './components/Client/Favorites';
import Payments from './components/Client/Payments';
import Reviews from './components/Client/Reviews';
import ClientMessages from './components/Client/Messages';
import ClientProfile from './components/Client/Profile';
import ClientSettings from './components/Client/Settings';
import AdminSetup from './components/Setup/AdminSetup';
import AdminSetupFixed from './components/Setup/AdminSetupFixed';
import SimpleAdminSetup from './components/Setup/SimpleAdminSetup';
import DebugAuth from './components/Debug/DebugAuth';
import TestPage from './components/Test/TestPage';
import SettingsConnectionTest from './components/Test/SettingsConnectionTest';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<UserSignIn />} />
          <Route path="/signup" element={<UserSignUp />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-setup" element={<AdminSetupFixed />} />
          <Route path="/admin-setup-old" element={<AdminSetup />} />
          <Route path="/simple-setup" element={<SimpleAdminSetup />} />
          <Route path="/debug" element={<DebugAuth />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/test-settings" element={<SettingsConnectionTest />} />
          <Route path="/admin-dashboard-bypass" element={<TestPage />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/onboarding" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Welcome to LockifyHub!</h1><p>Complete your profile setup.</p></div>} />
          
          {/* Host Routes */}
          <Route path="/host/listings/new" element={<AddListing />} />
          <Route path="/host/listings" element={<Listings />} />
          <Route path="/host/bookings" element={<Bookings />} />
          <Route path="/host/analytics" element={<Analytics />} />
          <Route path="/host/messages" element={<Messages />} />
          <Route path="/host/profile" element={<Profile />} />
          <Route path="/host/settings" element={<HostSettings />} />

          {/* Client Routes */}
          <Route path="/client/browse" element={<Browse />} />
          <Route path="/client/map" element={<MapView />} />
          <Route path="/client/bookings" element={<ClientBookings />} />
          <Route path="/client/favorites" element={<Favorites />} />
          <Route path="/client/payments" element={<Payments />} />
          <Route path="/client/reviews" element={<Reviews />} />
          <Route path="/client/messages" element={<ClientMessages />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          <Route path="/client/settings" element={<ClientSettings />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRouteDebug>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRouteDebug>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                <Layout>
                  <ListingManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Layout>
                  <BookingManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChatSupport />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Layout>
                  <Announcements />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsDashboard defaultTabParam />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <Layout>
                  <AuditLog />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <Layout>
                  <DisputeCenter />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationCenter />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payouts"
            element={
              <ProtectedRoute>
                <Layout>
                  <PayoutManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReviewManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/verification"
            element={
              <ProtectedRoute>
                <Layout>
                  <VerificationCenter />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">🤔 Route Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <p className="text-sm text-gray-500">URL: {window.location.pathname}</p>
                <a href="/" className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
