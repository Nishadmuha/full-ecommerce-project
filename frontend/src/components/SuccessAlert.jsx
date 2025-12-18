import React, { useEffect } from 'react';

export default function SuccessAlert({ message, isOpen, onClose, type = 'success' }) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
  const hoverBgColor = type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Alert Modal - Centered */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-slideUp overflow-hidden">
        {/* Decorative Top Border */}
        <div className={`h-1.5 ${bgColor} w-full`} />
        
        {/* Content Container */}
        <div className="flex flex-col items-center justify-center pt-10 pb-8 px-8">
          {/* Animated Icon Circle */}
          <div className={`relative w-24 h-24 rounded-full ${bgColor} flex items-center justify-center mb-6 animate-scaleIn shadow-lg`}>
            {type === 'success' ? (
              <svg 
                className="w-14 h-14 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            ) : (
              <svg 
                className="w-14 h-14 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            )}
            {/* Ripple effect */}
            <div className={`absolute inset-0 rounded-full ${bgColor} opacity-20 animate-ping`} />
          </div>

          {/* Title */}
          <h3 className={`text-2xl font-bold ${iconColor} text-center mb-3`}>
            {type === 'success' ? 'Success!' : 'Oops!'}
          </h3>
          
          {/* Message */}
          <p className="text-gray-700 text-center text-base leading-relaxed mb-6">
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl ${bgColor} ${hoverBgColor} text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

