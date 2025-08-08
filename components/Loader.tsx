
import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-brand-accent"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-brand-accent" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-brand-accent" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default Loader;
