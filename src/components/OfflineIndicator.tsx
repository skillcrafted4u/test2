import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { useSpring, animated } from 'react-spring';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRetry, setShowRetry] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRetry(false);
      // Trigger sync when coming back online
      if (pendingSync) {
        syncPendingData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRetry(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync data
    const hasPendingData = localStorage.getItem('pending_sync_data');
    if (hasPendingData) {
      setPendingSync(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  const syncPendingData = async () => {
    try {
      const pendingData = localStorage.getItem('pending_sync_data');
      if (pendingData) {
        // Simulate sync process
        console.log('Syncing pending data:', pendingData);
        
        // Remove pending data after successful sync
        localStorage.removeItem('pending_sync_data');
        setPendingSync(false);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleRetry = () => {
    // Force a connection check
    if (navigator.onLine) {
      setIsOnline(true);
      setShowRetry(false);
    }
  };

  // Animation for the indicator
  const indicatorAnimation = useSpring({
    opacity: !isOnline ? 1 : 0,
    transform: !isOnline ? 'translateY(0px)' : 'translateY(-100px)',
    config: { tension: 300, friction: 30 }
  });

  // Animation for sync status
  const syncAnimation = useSpring({
    opacity: pendingSync && isOnline ? 1 : 0,
    transform: pendingSync && isOnline ? 'scale(1)' : 'scale(0.8)',
  });

  if (isOnline && !pendingSync) return null;

  return (
    <>
      {/* Offline Indicator */}
      <animated.div
        style={indicatorAnimation}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-orange-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-orange-400/30">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">You're offline</span>
            {showRetry && (
              <button
                onClick={handleRetry}
                className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-orange-100 text-sm mt-1 text-center">
            Changes will sync when connection is restored
          </p>
        </div>
      </animated.div>

      {/* Sync Status */}
      <animated.div
        style={syncAnimation}
        className="fixed top-20 right-4 z-50"
      >
        <div className="bg-blue-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-blue-400/30">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Syncing...</span>
          </div>
        </div>
      </animated.div>
    </>
  );
};

export default OfflineIndicator;