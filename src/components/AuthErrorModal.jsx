import React from 'react';

const AuthErrorModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-red-500 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 p-6 text-center">
        
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 mb-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          ACCESS DENIED
        </h3>

        {/* Message */}
        <p className="text-gray-300 mb-6">
          {message || "You are not authorized to view this secure channel."}
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-red-600 border border-transparent rounded-lg font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Return to Base
        </button>
      </div>
    </div>
  );
};

export default AuthErrorModal;