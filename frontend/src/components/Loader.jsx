import React from 'react';

const Loader = ({ message = "Se încarcă..." }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center gap-3 animate-fade-in">
        <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
