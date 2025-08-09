import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'avatar';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white/5 rounded-2xl p-6 animate-pulse ${className}`}>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 animate-pulse ${className}`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="h-4 bg-white/10 rounded flex-1"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`space-y-2 animate-pulse ${className}`}>
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
            <div className="h-4 bg-white/10 rounded w-4/6"></div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className={`w-12 h-12 bg-white/10 rounded-full animate-pulse ${className}`}></div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;