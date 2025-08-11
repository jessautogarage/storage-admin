import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Lazy load components - Public routes
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const UserSignIn = lazy(() => import('./components/Auth/UserSignIn'));
const UserSignUp = lazy(() => import('./components/Auth/UserSignUp'));
const AdminLogin = lazy(() => import('./components/Auth/AdminLogin'));

// Lazy load Admin components
const Layout = lazy(() => import('./components/Layout/Layout'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const UserManagement = lazy(() => import('./components/Users/UserManagement'));
const ListingManagement = lazy(() => import('./components/Listings/ListingManagement'));
const BookingManagement = lazy(() => import('./components/Bookings/BookingManagement'));
const ChatSupport = lazy(() => import('./components/Chat/ChatSupport'));
const Announcements = lazy(() => import('./components/Announcements/Announcements'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const PaymentManagement = lazy(() => import('./components/Payments/PaymentManagement'));
const AnalyticsDashboard = lazy(() => import('./components/Analytics/AnalyticsDashboard'));
const AuditLog = lazy(() => import('./components/Audit/AuditLog'));
const DisputeCenter = lazy(() => import('./components/Disputes/DisputeCenter'));
const NotificationCenter = lazy(() => import('./components/Notifications/NotificationCenter'));
const PayoutManagement = lazy(() => import('./components/Payments/PayoutManagement'));
const ReviewManagement = lazy(() => import('./components/Reviews/ReviewManagement'));
const VerificationCenter = lazy(() => import('./components/Verification/VerificationCenter'));

// Lazy load Host components
const HostDashboard = lazy(() => import('./components/Dashboard/HostDashboard'));
const AddListing = lazy(() => import('./components/Host/AddListing'));
const Listings = lazy(() => import('./components/Host/Listings'));
const Bookings = lazy(() => import('./components/Host/Bookings'));
const Analytics = lazy(() => import('./components/Host/Analytics'));
const Messages = lazy(() => import('./components/Host/Messages'));
const Profile = lazy(() => import('./components/Host/Profile'));
const HostSettings = lazy(() => import('./components/Host/Settings'));

// Lazy load Client components
const ClientDashboard = lazy(() => import('./components/Dashboard/ClientDashboard'));
const Browse = lazy(() => import('./components/Client/Browse'));
const MapView = lazy(() => import('./components/Client/MapView'));
const ClientBookings = lazy(() => import('./components/Client/Bookings'));
const Favorites = lazy(() => import('./components/Client/Favorites'));
const Payments = lazy(() => import('./components/Client/Payments'));
const Reviews = lazy(() => import('./components/Client/Reviews'));
const ClientMessages = lazy(() => import('./components/Client/Messages'));
const ClientProfile = lazy(() => import('./components/Client/Profile'));
const ClientSettings = lazy(() => import('./components/Client/Settings'));

function AppOptimized() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<UserSignIn />} />
            <Route path="/signup" element={<UserSignUp />} />
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/client-dashboard" element={
              <RoleProtectedRoute allowedUserTypes={['client']}>
                <ClientDashboard />
              </RoleProtectedRoute>
            } />
            
            <Route path="/host-dashboard" element={
              <RoleProtectedRoute allowedUserTypes={['host']}>
                <HostDashboard />
              </RoleProtectedRoute>
            } />
            
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold">Welcome to LockifyHub!</h1>
                  <p>Complete your profile setup.</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Host Routes - All Protected */}
            <Route path="/host/*" element={
              <RoleProtectedRoute allowedUserTypes={['host']}>
                <Routes>
                  <Route path="listings/new" element={<AddListing />} />
                  <Route path="listings" element={<Listings />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<HostSettings />} />
                </Routes>
              </RoleProtectedRoute>
            } />

            {/* Client Routes - All Protected */}
            <Route path="/client/*" element={
              <RoleProtectedRoute allowedUserTypes={['client']}>
                <Routes>
                  <Route path="browse" element={<Browse />} />
                  <Route path="map" element={<MapView />} />
                  <Route path="bookings" element={<ClientBookings />} />
                  <Route path="favorites" element={<Favorites />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="messages" element={<ClientMessages />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="settings" element={<ClientSettings />} />
                </Routes>
              </RoleProtectedRoute>
            } />

            {/* Admin Routes - All Protected with Role Check */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/listings" element={
              <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                <Layout>
                  <ListingManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/bookings" element={
              <ProtectedRoute>
                <Layout>
                  <BookingManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout>
                  <ChatSupport />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/announcements" element={
              <ProtectedRoute>
                <Layout>
                  <Announcements />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <Layout>
                  <PaymentManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsDashboard defaultTabParam />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/audit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AuditLog />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/disputes" element={
              <ProtectedRoute>
                <Layout>
                  <DisputeCenter />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Layout>
                  <NotificationCenter />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/payouts" element={
              <ProtectedRoute>
                <Layout>
                  <PayoutManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reviews" element={
              <ProtectedRoute>
                <Layout>
                  <ReviewManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/verification" element={
              <ProtectedRoute>
                <Layout>
                  <VerificationCenter />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default AppOptimized;