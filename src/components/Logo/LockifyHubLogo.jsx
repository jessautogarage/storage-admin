import React from 'react';
import { Lock } from 'lucide-react';

const LockifyHubLogo = ({ size = 'medium' }) => {
  const sizes = {
    small: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      spacing: 'space-x-2'
    },
    medium: {
      icon: 'w-10 h-10',
      text: 'text-2xl',
      spacing: 'space-x-3'
    },
    large: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      spacing: 'space-x-3'
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`flex items-center ${currentSize.spacing}`}>
      <div className={`${currentSize.icon} bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center`}>
        <Lock className="text-white w-5 h-5" />
      </div>
      <span className={`${currentSize.text} font-bold text-gray-900`}>
        Lockify<span className="text-blue-600">Hub</span>
      </span>
    </div>
  );
};

export default LockifyHubLogo;