import React from 'react';
import { Lock, Shield } from 'lucide-react';

const LockifyHubLogo = ({ size = 'medium', variant = 'default' }) => {
  const sizes = {
    small: { container: 'w-8 h-8', icon: 20, text: 'text-lg' },
    medium: { container: 'w-10 h-10', icon: 24, text: 'text-2xl' },
    large: { container: 'w-16 h-16', icon: 32, text: 'text-4xl' },
    xlarge: { container: 'w-20 h-20', icon: 40, text: 'text-5xl' }
  };

  const variants = {
    default: {
      bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      text: 'text-gray-900',
      icon: 'text-white'
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      icon: 'text-blue-600'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      icon: 'text-blue-400'
    }
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <div className={`${currentSize.container} ${currentVariant.bg} rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        {/* Main Lock Icon */}
        <div className="relative">
          <Lock 
            size={currentSize.icon} 
            className={`${currentVariant.icon} drop-shadow-sm`}
            strokeWidth={2.5}
          />
          {/* Small shield accent */}
          <Shield 
            size={currentSize.icon * 0.4} 
            className={`absolute -top-1 -right-1 ${currentVariant.icon} opacity-80`}
            strokeWidth={3}
          />
        </div>
      </div>
      
      {/* Text Logo */}
      <div className={`${currentSize.text} font-bold ${currentVariant.text} tracking-tight`}>
        <span className="relative">
          Lockify
          <span className="text-blue-600">Hub</span>
          {/* Subtle underline accent */}
          <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-30"></div>
        </span>
      </div>
    </div>
  );
};

// Compact version for tight spaces
export const LockifyHubCompactLogo = ({ size = 'medium' }) => {
  const sizes = {
    small: { container: 'w-6 h-6', icon: 16 },
    medium: { container: 'w-8 h-8', icon: 20 },
    large: { container: 'w-10 h-10', icon: 24 }
  };

  const currentSize = sizes[size];

  return (
    <div className={`${currentSize.container} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <Lock 
        size={currentSize.icon} 
        className="text-white drop-shadow-sm relative z-10"
        strokeWidth={2.5}
      />
    </div>
  );
};

export default LockifyHubLogo;