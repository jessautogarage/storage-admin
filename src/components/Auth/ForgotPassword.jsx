import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';
import LockifyHubLogo from '../Logo/LockifyHubLogo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative">
      {/* Back to Sign In Link */}
      <Link 
        to="/signin" 
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Sign In</span>
      </Link>

      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LockifyHubLogo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {emailSent ? 'Check Your Email' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {emailSent 
                ? 'We\'ve sent a password reset link to your email' 
                : 'Enter your email to receive a password reset link'
              }
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="text-sm">{message}</span>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">Didn't receive the email? Check your spam folder or try again.</p>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setMessage('');
                    setError('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try different email
                </button>
              </div>

              <div className="text-center">
                <Link 
                  to="/signin" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;