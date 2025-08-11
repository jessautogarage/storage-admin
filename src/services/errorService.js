import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebaseConfig';

const functions = getFunctions(app);

class ErrorService {
  constructor() {
    this.errorQueue = [];
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        type: 'javascript'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        type: 'promise'
      });
    });
  }

  /**
   * Main error handler
   */
  handleError(error, context = {}) {
    const errorInfo = this.normalizeError(error);
    const enrichedError = this.enrichError(errorInfo, context);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', enrichedError);
    }

    // Add to queue for batch processing
    this.errorQueue.push(enrichedError);

    // Send immediately if critical
    if (enrichedError.severity === 'critical') {
      this.sendErrorToServer(enrichedError);
    } else {
      // Batch non-critical errors
      this.scheduleBatchSend();
    }

    return enrichedError;
  }

  /**
   * Normalize different error formats
   */
  normalizeError(error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      };
    }

    if (typeof error === 'string') {
      return { message: error };
    }

    return error;
  }

  /**
   * Enrich error with additional context
   */
  enrichError(error, context) {
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toISOString();
    const url = window.location.href;

    return {
      ...error,
      ...context,
      timestamp,
      url,
      userAgent,
      severity: this.determineSeverity(error),
      category: this.categorizeError(error),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      environment: process.env.NODE_ENV
    };
  }

  /**
   * Determine error severity
   */
  determineSeverity(error) {
    // Critical errors
    if (
      error.message?.includes('Firebase') ||
      error.message?.includes('Authentication') ||
      error.code === 'permission-denied'
    ) {
      return 'critical';
    }

    // High severity
    if (
      error.message?.includes('payment') ||
      error.message?.includes('booking') ||
      error.type === 'promise'
    ) {
      return 'high';
    }

    // Medium severity
    if (error.type === 'javascript') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Categorize error for better organization
   */
  categorizeError(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('firebase') || message.includes('firestore')) {
      return 'database';
    }
    if (message.includes('auth') || message.includes('permission')) {
      return 'authentication';
    }
    if (message.includes('payment') || message.includes('stripe')) {
      return 'payment';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (error.type === 'validation') {
      return 'validation';
    }
    
    return 'general';
  }

  /**
   * Get current user ID if available
   */
  getCurrentUserId() {
    // This should be implemented based on your auth system
    return localStorage.getItem('userId') || 'anonymous';
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Send error to server
   */
  async sendErrorToServer(error) {
    if (!this.isOnline) {
      return;
    }

    try {
      // If Cloud Functions are set up
      const logError = httpsCallable(functions, 'logError');
      await logError({ error });
    } catch (sendError) {
      // Fallback to console if sending fails
      console.error('Failed to send error to server:', sendError);
      
      // Store in localStorage as last resort
      this.storeErrorLocally(error);
    }
  }

  /**
   * Store error locally when offline
   */
  storeErrorLocally(error) {
    const storedErrors = JSON.parse(localStorage.getItem('errorLog') || '[]');
    storedErrors.push(error);
    
    // Keep only last 50 errors
    if (storedErrors.length > 50) {
      storedErrors.shift();
    }
    
    localStorage.setItem('errorLog', JSON.stringify(storedErrors));
  }

  /**
   * Schedule batch sending of errors
   */
  scheduleBatchSend() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushErrorQueue();
    }, 5000); // Send after 5 seconds
  }

  /**
   * Flush error queue
   */
  async flushErrorQueue() {
    if (this.errorQueue.length === 0 || !this.isOnline) {
      return;
    }

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const logErrors = httpsCallable(functions, 'logErrors');
      await logErrors({ errors });
    } catch (error) {
      // Put errors back in queue if sending fails
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * Firebase-specific error handler
   */
  handleFirebaseError(error) {
    const errorMessages = {
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'permission-denied': 'You do not have permission to perform this action.',
      'unavailable': 'Service temporarily unavailable. Please try again.',
      'deadline-exceeded': 'Request timeout. Please try again.',
      'resource-exhausted': 'Too many requests. Please wait and try again.',
      'not-found': 'The requested resource was not found.',
      'already-exists': 'This resource already exists.',
      'failed-precondition': 'Operation failed. Please check the requirements.',
      'aborted': 'Operation was cancelled.',
      'out-of-range': 'Operation is out of valid range.',
      'unimplemented': 'This feature is not yet implemented.',
      'internal': 'Internal error. Please try again later.',
      'data-loss': 'Data loss detected. Please contact support.',
      'unauthenticated': 'Please sign in to continue.'
    };

    const code = error.code || error.message;
    const userMessage = errorMessages[code] || 'An unexpected error occurred. Please try again.';

    return {
      originalError: error,
      userMessage,
      code,
      handled: true
    };
  }

  /**
   * Create user-friendly error messages
   */
  getUserMessage(error) {
    if (error.userMessage) {
      return error.userMessage;
    }

    const category = error.category || this.categorizeError(error);
    
    const messages = {
      database: 'We're having trouble accessing data. Please try again.',
      authentication: 'Authentication error. Please sign in again.',
      payment: 'Payment processing error. Please check your payment details.',
      network: 'Connection error. Please check your internet connection.',
      validation: 'Please check your input and try again.',
      general: 'Something went wrong. Please try again.'
    };

    return messages[category] || messages.general;
  }
}

// Create singleton instance
const errorService = new ErrorService();

// React Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorService.handleError(error, {
      componentStack: errorInfo.componentStack,
      type: 'react-error-boundary'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-gray-600">We're sorry for the inconvenience. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export service and utilities
export { errorService };

// React Hook for error handling
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, context) => {
    return errorService.handleError(error, context);
  }, []);

  const handleFirebaseError = React.useCallback((error) => {
    return errorService.handleFirebaseError(error);
  }, []);

  return { handleError, handleFirebaseError };
};