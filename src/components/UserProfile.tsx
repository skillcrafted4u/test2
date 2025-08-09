import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Heart, Bookmark, Users, Award, TrendingUp, Settings, Camera, Edit3, Star, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTrips } from '../hooks/useTrips';
import { useTripSharing } from '../hooks/useTripSharing';

interface UserStats {
  tripsCount: number;
  countriesVisited: number;
  totalDistance: number;
  favoriteMood: string;
  travelStreak: number;
  badges: Badge[];
  followers: number;
  following: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { trips } = useTrips();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'trips' | 'saved' | 'stats' | 'badges'>('trips');
  const [showSettings, setShowSettings] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(75);

  // Mock user stats
  useEffect(() => {
    const mockStats: UserStats = {
      tripsCount: trips.length,
      countriesVisited: 12,
      totalDistance: 45000,
      favoriteMood: 'adventure',
      travelStreak: 5,
      badges: [
        {
          id: 'adventure-seeker',
          name: 'Adventure Seeker',
          description: 'Completed 5 adventure trips',
          icon: '🏔️',
          unlockedAt: '2024-01-15',
          rarity: 'common'
        },
        {
          id: 'culture-vulture',
          name: 'Culture Vulture',
          description: 'Visited 10 cultural sites',
          icon: '🏛️',
          unlockedAt: '2024-02-20',
          rarity: 'rare'
        },
        {
          id: 'budget-master',
          name: 'Budget Master',
          description: 'Stayed under budget on 3 consecutive trips',
          icon: '💰',
          unlockedAt: '2024-03-10',
          rarity: 'epic'
        }
      ],
      followers: 234,
      following: 89
    };
    setUserStats(mockStats);
  }, [trips]);

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStreakEmojis = (streak: number) => {
    return '🔥'.repeat(Math.min(streak, 5));
  };

  if (!user || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading your travel profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1">
                <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-200">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.email?.split('@')[0]}</h1>
                <button className="text-white/60 hover:text-white transition-colors duration-200">
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/70 mb-4">✈️ Passionate traveler exploring the world one adventure at a time</p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.tripsCount}</div>
                  <div className="text-white/70 text-sm">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.countriesVisited}</div>
                  <div className="text-white/70 text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.followers}</div>
                  <div className="text-white/70 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.following}</div>
                  <div className="text-white/70 text-sm">Following</div>
                </div>
              </div>

              {/* Travel Streak */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-white/80">Travel Streak:</span>
                <span className="text-2xl">{getStreakEmojis(userStats.travelStreak)}</span>
                <span className="text-white font-semibold">{userStats.travelStreak} trips</span>
              </div>

              {/* Profile Completion */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Profile Completion</span>
                  <span className="text-white font-semibold text-sm">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 border border-white/20 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'trips', label: 'My Trips', icon: MapPin },
              { id: 'saved', label: 'Saved', icon: Bookmark },
              { id: 'stats', label: 'Stats', icon: TrendingUp },
              { id: 'badges', label: 'Badges', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          
          {/* My Trips */}
          {activeTab === 'trips' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Trips</h2>
                <div className="text-white/70">{trips.length} trips created</div>
              </div>
              
              {trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trips.map(trip => (
                    <div key={trip.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">{trip.destination}</h3>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4 text-white/60" />
                          <span className="text-white/60 text-sm">Public</span>
                        </div>
                      </div>
                      <div className="text-white/70 text-sm mb-4">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                          ${trip.budget?.toLocaleString()} • {trip.traveler_count} travelers
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-white/70 text-sm">12</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">✈️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No trips yet</h3>
                  <p className="text-white/70 mb-6">Start planning your first adventure!</p>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200">
                    Plan Your First Trip
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Saved Trips */}
          {activeTab === 'saved' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Saved Trips</h2>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔖</div>
                <h3 className="text-2xl font-bold text-white mb-2">No saved trips</h3>
                <p className="text-white/70">Discover amazing trips from other travelers and save them here!</p>
              </div>
            </div>
          )}

          {/* Stats */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Travel Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Distance Traveled */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{userStats.totalDistance.toLocaleString()}</div>
                      <div className="text-white/70 text-sm">Miles Traveled</div>
                    </div>
                  </div>
                  <div className="text-white/60 text-sm">Equivalent to 1.8x around the Earth!</div>
                </div>

                {/* Favorite Mood */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white capitalize">{userStats.favoriteMood}</div>
                      <div className="text-white/70 text-sm">Favorite Mood</div>
                    </div>
                  </div>
                  <div className="text-white/60 text-sm">You love adventure-packed trips!</div>
                </div>

                {/* Travel Streak */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white flex items-center">
                        {userStats.travelStreak} {getStreakEmojis(userStats.travelStreak)}
                      </div>
                      <div className="text-white/70 text-sm">Travel Streak</div>
                    </div>
                  </div>
                  <div className="text-white/60 text-sm">Keep it up! You're on fire!</div>
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          {activeTab === 'badges' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Travel Badges</h2>
                <div className="text-white/70">{userStats.badges.length} badges earned</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStats.badges.map(badge => (
                  <div key={badge.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getBadgeColor(badge.rarity)} flex items-center justify-center text-2xl shadow-lg`}>
                        {badge.icon}
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{badge.name}</h3>
                      <p className="text-white/70 text-sm mb-3">{badge.description}</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getBadgeColor(badge.rarity)} text-white`}>
                          {badge.rarity.toUpperCase()}
                        </div>
                        <div className="text-white/60 text-xs">
                          {new Date(badge.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Locked Badges */}
                {[
                  { name: 'Globe Trotter', description: 'Visit 25 countries', icon: '🌍', rarity: 'legendary' },
                  { name: 'Social Butterfly', description: 'Get 100 followers', icon: '🦋', rarity: 'epic' }
                ].map((lockedBadge, index) => (
                  <div key={`locked-${index}`} className="bg-white/5 rounded-2xl p-6 border border-white/10 opacity-50">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center text-2xl">
                        🔒
                      </div>
                      <h3 className="text-white/70 font-semibold text-lg mb-2">{lockedBadge.name}</h3>
                      <p className="text-white/50 text-sm mb-3">{lockedBadge.description}</p>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-white/50 inline-block">
                        LOCKED
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;