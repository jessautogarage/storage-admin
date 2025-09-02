// App.jsx with enhancements
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextSafe';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './components/Notifications/EnhancedToast';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';
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
import ModernLandingPage from './components/Landing/ModernLandingPage';
import UserSignIn from './components/Auth/UserSignIn';
import UserSignUp from './components/Auth/UserSignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import AuthFlowTest from './components/Test/AuthFlowTest';
import BookingSignatureTest from './components/Test/BookingSignatureTest';
import ModernHostDashboard from './components/Host/ModernHostDashboard';
import ModernClientDashboard from './components/Client/ModernClientDashboard';
import AuditLog from './components/Audit/AuditLog';
import DisputeCenter from './components/Disputes/DisputeCenter';
import NotificationCenter from './components/Notifications/NotificationCenter';
import PayoutManagement from './components/Payments/PayoutManagement';
import ReviewManagement from './components/Reviews/ReviewManagement';
import VerificationCenter from './components/Verification/VerificationCenter';
import AddListing from './components/Host/AddListingFixed';
import EditListing from './components/Host/EditListing';
import ManageAvailability from './components/Host/ManageAvailability';
import Listings from './components/Host/Listings';
import Bookings from './components/Host/Bookings';
import Analytics from './components/Host/Analytics';
import Messages from './components/Host/Messages';
import Profile from './components/Host/Profile';
import HostSettings from './components/Host/Settings';
import Wallet from './components/Host/Wallet';
import ModernBrowse from './components/Client/ModernBrowse';
import ModernMapView from './components/Client/ModernMapView';
import ModernBookings from './components/Client/ModernBookings';
import ModernFavorites from './components/Client/ModernFavorites';
import ModernPayments from './components/Client/ModernPayments';
import ModernReviews from './components/Client/ModernReviews';
import ModernMessages from './components/Client/ModernMessages';
import ModernProfile from './components/Client/ModernProfile';
import ModernSettings from './components/Client/ModernSettings';
import ListingDetail from './components/Client/ListingDetail';
import ListingDataDebug from './components/Debug/ListingDataDebug';
import InteractiveTutorial from './components/Tutorial/InteractiveTutorial';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
        <Routes>
          <Route path="/" element={<ModernLandingPage />} />
          <Route path="/signin" element={<UserSignIn />} />
          <Route path="/signup" element={<UserSignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test-auth" element={<AuthFlowTest />} />
          <Route path="/test-signature" element={<BookingSignatureTest />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/client-dashboard" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernClientDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/host/dashboard" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <ModernHostDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/host-dashboard" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <ModernHostDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <InteractiveTutorial />
            </RoleProtectedRoute>
          } />
          <Route path="/tutorial" element={
            <RoleProtectedRoute allowedUserTypes={['host', 'client']}>
              <InteractiveTutorial />
            </RoleProtectedRoute>
          } />
          
          {/* Host Routes */}
          <Route path="/host/listings/new" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <AddListing />
            </RoleProtectedRoute>
          } />
          <Route path="/host/listings/:listingId/edit" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <EditListing />
            </RoleProtectedRoute>
          } />
          <Route path="/host/listings/:listingId/availability" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <ManageAvailability />
            </RoleProtectedRoute>
          } />
          <Route path="/host/listings" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <Listings />
            </RoleProtectedRoute>
          } />
          <Route path="/host/bookings" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <Bookings />
            </RoleProtectedRoute>
          } />
          <Route path="/host/analytics" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <Analytics />
            </RoleProtectedRoute>
          } />
          <Route path="/host/messages" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <Messages />
            </RoleProtectedRoute>
          } />
          <Route path="/host/profile" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <Profile />
            </RoleProtectedRoute>
          } />
          <Route path="/host/settings" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <HostSettings />
            </RoleProtectedRoute>
          } />
          <Route path="/host/wallet" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <Wallet />
            </RoleProtectedRoute>
          } />

          {/* Client Routes - Modern Design */}
          <Route path="/client/browse" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernBrowse />
            </RoleProtectedRoute>
          } />
          <Route path="/client/map" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernMapView />
            </RoleProtectedRoute>
          } />
          <Route path="/client/bookings" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernBookings />
            </RoleProtectedRoute>
          } />
          <Route path="/client/favorites" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernFavorites />
            </RoleProtectedRoute>
          } />
          <Route path="/client/payments" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernPayments />
            </RoleProtectedRoute>
          } />
          <Route path="/client/reviews" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernReviews />
            </RoleProtectedRoute>
          } />
          <Route path="/client/messages" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernMessages />
            </RoleProtectedRoute>
          } />
          
          <Route path="/client/profile" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernProfile />
            </RoleProtectedRoute>
          } />
          <Route path="/client/settings" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ModernSettings />
            </RoleProtectedRoute>
          } />
          <Route path="/client/listing/:listingId" element={
            <RoleProtectedRoute allowedUserTypes={['client']}>
              <ListingDetail />
            </RoleProtectedRoute>
          } />
          <Route path="/debug/listings" element={
            <RoleProtectedRoute allowedUserTypes={['host']}>
              <ListingDataDebug />
            </RoleProtectedRoute>
          } />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
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
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;