import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';

// Toast Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      timestamp: Date.now(),
      ...toast
    };
    
    setToasts(prev => [newToast, ...prev]);

    // Auto-remove toast
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration || 5000);
    }

    return id;
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods - memoized to prevent infinite loops
  const showSuccess = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      title: 'Success!',
      message,
      ...options
    });
  }, [addToast]);

  const showError = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      title: 'Error',
      message,
      duration: 7000, // Errors stay longer
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      title: 'Warning',
      message,
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      title: 'Info',
      message,
      ...options
    });
  }, [addToast]);

  const showLoading = useCallback((message, options = {}) => {
    return addToast({
      type: 'loading',
      title: 'Loading',
      message,
      duration: 0, // Don't auto-remove loading toasts
      ...options
    });
  }, [addToast]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  }), [toasts, addToast, removeToast, clearAllToasts, showSuccess, showError, showWarning, showInfo, showLoading]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);
  }, []); // Empty dependency array - only run once on mount

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <XCircle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'info':
        return <Info className="text-blue-600" size={20} />;
      case 'loading':
        return <Loader2 className="text-blue-600 animate-spin" size={20} />;
      default:
        return <Info className="text-gray-600" size={20} />;
    }
  };

  const getStyles = () => {
    const baseStyles = `
      transform transition-all duration-300 ease-in-out
      ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `;

    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-white border-l-4 border-green-500 shadow-lg`;
      case 'error':
        return `${baseStyles} bg-white border-l-4 border-red-500 shadow-lg`;
      case 'warning':
        return `${baseStyles} bg-white border-l-4 border-yellow-500 shadow-lg`;
      case 'info':
        return `${baseStyles} bg-white border-l-4 border-blue-500 shadow-lg`;
      case 'loading':
        return `${baseStyles} bg-white border-l-4 border-blue-500 shadow-lg`;
      default:
        return `${baseStyles} bg-white border border-gray-200 shadow-lg`;
    }
  };

  return (
    <div className={`relative rounded-lg p-4 mb-3 max-w-sm w-full ${getStyles()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {toast.title}
            </p>
          )}
          
          <p className="text-sm text-gray-700 break-words">
            {toast.message}
          </p>
          
          {toast.actions && (
            <div className="flex space-x-2 mt-3">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    if (action.closeOnClick !== false) handleClose();
                  }}
                  className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                    action.style === 'primary' 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {toast.dismissible !== false && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Progress bar for timed toasts */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-20 animate-progress"
            style={{
              animationDuration: `${toast.duration}ms`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Enhanced Toast Hook with more features
export const useEnhancedToast = () => {
  const toast = useToast();

  return {
    ...toast,
    
    // Action toasts
    showActionToast: (message, actions, options = {}) => {
      return toast.addToast({
        type: 'info',
        message,
        actions,
        duration: 0, // Don't auto-close action toasts
        ...options
      });
    },

    // Confirmation toast
    showConfirm: (message, onConfirm, options = {}) => {
      return toast.addToast({
        type: 'warning',
        title: 'Confirm Action',
        message,
        actions: [
          {
            label: 'Cancel',
            onClick: () => {},
            style: 'secondary'
          },
          {
            label: 'Confirm',
            onClick: onConfirm,
            style: 'primary'
          }
        ],
        duration: 0,
        ...options
      });
    },

    // Progress toast
    showProgress: (message, progress, options = {}) => {
      return toast.addToast({
        type: 'info',
        message: `${message} (${progress}%)`,
        duration: 0,
        dismissible: false,
        ...options
      });
    },

    // Persistent error
    showPersistentError: (message, retry, options = {}) => {
      return toast.addToast({
        type: 'error',
        message,
        actions: retry ? [
          {
            label: 'Retry',
            onClick: retry,
            style: 'primary',
            closeOnClick: true
          }
        ] : undefined,
        duration: 0,
        ...options
      });
    }
  };
};

// Add CSS animation for progress bar
const progressCSS = `
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  .animate-progress {
    animation-name: progress;
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = progressCSS;
  document.head.appendChild(style);
}

export default Toast;