import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { moods } from '../data/moods';

interface LiveActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  action: 'planning' | 'completed' | 'shared' | 'loved';
  destination: string;
  mood: string;
  timestamp: Date;
  details?: {
    budget?: number;
    duration?: number;
    travelers?: number;
  };
}

interface LiveActivityProps {
  maxItems?: number;
  autoUpdate?: boolean;
  showDetails?: boolean;
}

const LiveActivity: React.FC<LiveActivityProps> = ({ 
  maxItems = 6, 
  autoUpdate = true, 
  showDetails = true 
}) => {
  const [activities, setActivities] = useState<LiveActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Generate mock live activities
  const generateMockActivity = (): LiveActivityItem => {
    const users = [
      { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', isVerified: true },
      { name: 'Marco Silva', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', isVerified: false },
      { name: 'Emma Johnson', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100', isVerified: true },
      { name: 'Alex Kim', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', isVerified: false },
      { name: 'Lisa Wang', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', isVerified: true },
      { name: 'David Brown', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', isVerified: false }
    ];

    const destinations = [
      'Tokyo, Japan', 'Paris, France', 'Bali, Indonesia', 'New York, USA',
      'Rome, Italy', 'Barcelona, Spain', 'Bangkok, Thailand', 'London, UK',
      'Sydney, Australia', 'Dubai, UAE', 'Amsterdam, Netherlands', 'Prague, Czech Republic'
    ];

    const actions: LiveActivityItem['action'][] = ['planning', 'completed', 'shared', 'loved'];
    
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    return {
      id: `activity-${Date.now()}-${Math.random()}`,
      user: randomUser,
      action: randomAction,
      destination: randomDestination,
      mood: randomMood.id,
      timestamp: new Date(),
      details: {
        budget: Math.floor(Math.random() * 4000) + 1000,
        duration: Math.floor(Math.random() * 14) + 3,
        travelers: Math.floor(Math.random() * 4) + 1
      }
    };
  };

  // Initialize with mock data
  useEffect(() => {
    const initialActivities = Array.from({ length: maxItems }, () => generateMockActivity());
    setActivities(initialActivities);
  }, [maxItems]);

  // Auto-update activities
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      if (isLive) {
        const newActivity = generateMockActivity();
        setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
      }
    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds

    return () => clearInterval(interval);
  }, [autoUpdate, isLive, maxItems]);

  const getActionText = (activity: LiveActivityItem) => {
    const moodData = moods.find(m => m.id === activity.mood);
    const moodEmoji = moodData?.emoji || '✨';
    
    switch (activity.action) {
      case 'planning':
        return `is planning a ${moodEmoji} trip to ${activity.destination}`;
      case 'completed':
        return `just completed an amazing trip to ${activity.destination}`;
      case 'shared':
        return `shared their ${moodEmoji} ${activity.destination} itinerary`;
      case 'loved':
        return `loved a ${activity.destination} travel story`;
      default:
        return `is exploring ${activity.destination}`;
    }
  };

  const getActionColor = (action: LiveActivityItem['action']) => {
    switch (action) {
      case 'planning': return 'from-blue-400 to-purple-500';
      case 'completed': return 'from-green-400 to-teal-500';
      case 'shared': return 'from-orange-400 to-red-500';
      case 'loved': return 'from-pink-400 to-rose-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Live Community Activity</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white/70 text-sm">{isLive ? 'Live' : 'Paused'}</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
        >
          {isLive ? 'Pause' : 'Resume'} Updates
        </button>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-500 hover:bg-white/15 ${
              index === 0 ? 'animate-fade-in-up' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              
              {/* User Avatar */}
              <div className="relative">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                {activity.user.isVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {/* Activity Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white font-medium">{activity.user.name}</span>
                  <span className="text-white/80 text-sm">{getActionText(activity)}</span>
                </div>
                
                {showDetails && activity.details && (
                  <div className="flex items-center space-x-4 text-white/60 text-sm">
                    {activity.details.budget && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${activity.details.budget.toLocaleString()}</span>
                      </div>
                    )}
                    {activity.details.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.details.duration} days</span>
                      </div>
                    )}
                    {activity.details.travelers && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{activity.details.travelers} travelers</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Badge & Timestamp */}
              <div className="text-right">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getActionColor(activity.action)} flex items-center justify-center mb-1`}>
                  {activity.action === 'planning' && <Sparkles className="w-4 h-4 text-white" />}
                  {activity.action === 'completed' && <span className="text-white text-sm">✓</span>}
                  {activity.action === 'shared' && <span className="text-white text-sm">📤</span>}
                  {activity.action === 'loved' && <span className="text-white text-sm">❤️</span>}
                </div>
                <div className="text-white/60 text-xs">{getTimeAgo(activity.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-white font-bold text-lg">
              {activities.filter(a => a.action === 'planning').length}
            </div>
            <div className="text-white/70 text-sm">Planning Now</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg">
              {activities.filter(a => a.action === 'completed').length}
            </div>
            <div className="text-white/70 text-sm">Completed Today</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg">
              {activities.filter(a => a.action === 'shared').length}
            </div>
            <div className="text-white/70 text-sm">Shared Stories</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveActivity;