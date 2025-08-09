import React, { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, Star, TrendingUp, Globe, Camera, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityStats {
  totalTravelers: number;
  storiesShared: number;
  countriesCovered: number;
  averageRating: number;
  activePlanners: number;
}

interface FeaturedStory {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  destination: string;
  image: string;
  excerpt: string;
  likes: number;
  comments: number;
  timeAgo: string;
  featured: boolean;
}

interface LiveActivity {
  id: string;
  user: string;
  action: string;
  destination: string;
  timeAgo: string;
  avatar: string;
  mood?: string;
}

const CommunitySection: React.FC = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalTravelers: 127543,
    storiesShared: 50284,
    countriesCovered: 195,
    averageRating: 4.9,
    activePlanners: 1247
  });

  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [featuredStories, setFeaturedStories] = useState<FeaturedStory[]>([]);
  const [currentActivity, setCurrentActivity] = useState(0);

  // Mock data initialization
  useEffect(() => {
    const mockActivities: LiveActivity[] = [
      { id: '1', user: 'Sarah Chen', action: 'just planned a trip to', destination: 'Tokyo, Japan', timeAgo: '2m ago', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50', mood: 'culture' },
      { id: '2', user: 'Marco Silva', action: 'completed an adventure in', destination: 'Patagonia, Chile', timeAgo: '5m ago', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50', mood: 'adventure' },
      { id: '3', user: 'Emma Johnson', action: 'shared a story from', destination: 'Bali, Indonesia', timeAgo: '8m ago', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=50', mood: 'relaxation' },
      { id: '4', user: 'Alex Kim', action: 'discovered a hidden gem in', destination: 'Prague, Czech Republic', timeAgo: '12m ago', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50', mood: 'culture' },
      { id: '5', user: 'Lisa Wang', action: 'loved a story about', destination: 'Santorini, Greece', timeAgo: '15m ago', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50', mood: 'romantic' },
      { id: '6', user: 'David Brown', action: 'started planning for', destination: 'Iceland', timeAgo: '18m ago', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50', mood: 'nature' }
    ];

    const mockStories: FeaturedStory[] = [
      {
        id: 'story-1',
        title: 'The Hidden Ramen Shop That Changed My Tokyo Trip',
        author: { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', verified: true },
        destination: 'Tokyo, Japan',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        excerpt: 'Wandering through Shibuya at 2 AM, I discovered this tiny ramen shop with no English sign...',
        likes: 156,
        comments: 34,
        timeAgo: '2 days ago',
        featured: true
      },
      {
        id: 'story-2',
        title: 'How I Got Lost in Marrakech and Found Magic',
        author: { name: 'Ahmed Hassan', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', verified: true },
        destination: 'Marrakech, Morocco',
        image: 'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=400',
        excerpt: 'GPS failed, phone died, spoke zero Arabic. What started as disaster became the best day...',
        likes: 203,
        comments: 67,
        timeAgo: '1 week ago',
        featured: true
      },
      {
        id: 'story-3',
        title: 'Solo Female Travel in India: My Honest Experience',
        author: { name: 'Priya Sharma', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100', verified: true },
        destination: 'Rajasthan, India',
        image: 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=400',
        excerpt: 'Everything I wish I knew before my solo journey through the land of maharajas...',
        likes: 89,
        comments: 23,
        timeAgo: '3 days ago',
        featured: false
      }
    ];

    setLiveActivities(mockActivities);
    setFeaturedStories(mockStories);
  }, []);

  // Auto-rotate live activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % liveActivities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveActivities.length]);

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalTravelers: prev.totalTravelers + Math.floor(Math.random() * 3),
        activePlanners: 1200 + Math.floor(Math.random() * 100)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getMoodEmoji = (mood?: string) => {
    const moodEmojis: Record<string, string> = {
      adventure: '🏔️',
      culture: '🏛️',
      relaxation: '🏖️',
      romantic: '💕',
      nature: '🌿',
      food: '🍜'
    };
    return moodEmojis[mood || ''] || '✨';
  };

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Join the Global Travel Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 max-w-3xl mx-auto"
          >
            Connect with fellow adventurers, share authentic stories, and discover hidden gems from real travelers
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-white font-semibold text-lg">Live Activity</h3>
              <span className="text-white/60 text-sm">({stats.activePlanners} planning now)</span>
            </div>
            
            <div className="space-y-4 h-80 overflow-hidden">
              {liveActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: index === currentActivity ? 1 : 0.6,
                    y: 0,
                    scale: index === currentActivity ? 1.05 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-500 ${
                    index === currentActivity ? 'bg-white/15 border border-white/20' : 'bg-white/5'
                  }`}
                >
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                  <div className="flex-1">
                    <p className="text-white/90 text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.destination}</span>
                      {activity.mood && <span className="ml-2">{getMoodEmoji(activity.mood)}</span>}
                    </p>
                    <p className="text-white/60 text-xs">{activity.timeAgo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured Stories */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Featured Stories</h3>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            
            <div className="space-y-4">
              {featuredStories.slice(0, 3).map((story, index) => (
                <div key={story.id} className="group cursor-pointer">
                  <div className="flex space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1 line-clamp-2 group-hover:text-yellow-300 transition-colors duration-200">
                        {story.title}
                      </h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={story.author.avatar}
                          alt={story.author.name}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-white/70 text-xs">{story.author.name}</span>
                        {story.author.verified && <span className="text-blue-400 text-xs">✓</span>}
                      </div>
                      <div className="flex items-center space-x-3 text-white/60 text-xs">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{story.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{story.comments}</span>
                        </div>
                        <span>{story.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white py-3 rounded-2xl font-medium transition-all duration-200">
              Read More Stories →
            </button>
          </motion.div>

          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Real-time Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-white font-semibold text-lg">Community Impact</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {stats.totalTravelers.toLocaleString()}
                  </div>
                  <div className="text-white/70 text-sm">Total Travelers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {stats.storiesShared.toLocaleString()}
                  </div>
                  <div className="text-white/70 text-sm">Stories Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stats.countriesCovered}</div>
                  <div className="text-white/70 text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stats.averageRating}★</div>
                  <div className="text-white/70 text-sm">Avg Rating</div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-4">What Travelers Say</h3>
              
              <div className="space-y-4">
                {[
                  { quote: "Wanderlust made planning my honeymoon effortless!", author: "Jessica & Mike", rating: 5 },
                  { quote: "The AI suggestions were spot-on for my solo adventure", author: "David K.", rating: 5 },
                  { quote: "Found hidden gems I never would have discovered", author: "Maria L.", rating: 5 }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 text-sm mb-2">"{testimonial.quote}"</p>
                    <p className="text-white/60 text-xs">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Join Community CTA */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-6 border border-purple-500/20">
              <div className="text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-white font-semibold text-lg mb-2">Join Our Community</h3>
                <p className="text-white/80 text-sm mb-4">
                  Share your stories, get inspired, and help fellow travelers discover amazing experiences
                </p>
                <button className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 w-full">
                  Start Sharing Stories
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Global Map Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Travelers Around the World</h3>
            <p className="text-white/80">See where our community is exploring right now</p>
          </div>
          
          {/* Simplified World Map Representation */}
          <div className="relative bg-white/5 rounded-2xl p-8 h-64 flex items-center justify-center border border-white/10">
            <div className="text-6xl mb-4">🗺️</div>
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {/* Animated dots representing active travelers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xl font-bold text-white">🌏 Asia</div>
              <div className="text-white/70 text-sm">12,847 trips</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xl font-bold text-white">🌍 Europe</div>
              <div className="text-white/70 text-sm">23,156 trips</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xl font-bold text-white">🌎 Americas</div>
              <div className="text-white/70 text-sm">18,934 trips</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xl font-bold text-white">🌍 Africa</div>
              <div className="text-white/70 text-sm">5,672 trips</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunitySection;