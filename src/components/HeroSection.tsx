import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Play, Globe, Users, Star } from 'lucide-react';
import { MorphingText } from './magicui/morphing-text';
import { motion } from 'framer-motion';
import SmartTripPlanner from './SmartTripPlanner';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
  onStories: () => void;
}

const taglines = [
  "Life is short. The world is wide.",
  "Adventure awaits around every corner.", 
  "Create memories that last forever.",
  "Your next great story starts here.",
  "Discover the extraordinary in every journey.",
  "Turn wanderlust into wonder-filled adventures."
];

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExplore, onStories }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: "127K+", label: "Trips Planned", icon: "✈️" },
    { number: "4.9★", label: "User Rating", icon: "⭐" },
    { number: "195", label: "Countries", icon: "🌍" },
    { number: "23s", label: "Avg. Planning", icon: "⚡" }
  ];

  // Rotate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const handlePlanTrip = (tripData: any) => {
    console.log('Planning trip with data:', tripData);
    onGetStarted();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Fredoka One, cursive' }}>
            AI-Powered Travel Planning
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              Made Magical
            </span>
          </h1>
          
          {/* Rotating Taglines */}
          <div className="h-16 flex items-center justify-center mb-8">
            <MorphingText
              texts={taglines}
              className="text-xl sm:text-2xl text-white/90 font-medium"
              duration={3000}
            />
          </div>
        </motion.div>

        {/* Smart Trip Planner */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12"
        >
          <SmartTripPlanner onPlanTrip={handlePlanTrip} />
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
        >
          <button
            onClick={() => setShowVideo(true)}
            className="group flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span>Watch How It Works</span>
          </button>
          
          <button
            onClick={onExplore}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <Globe className="w-4 h-4" />
            <span>Explore Amazing Trips</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onStories}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <Users className="w-4 h-4" />
            <span>Read Travel Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Animated Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 inline-block"
        >
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stats[currentStat].number}</div>
              <div className="text-white/70 text-sm">{stats[currentStat].label}</div>
            </div>
            <div className="text-4xl">{stats[currentStat].icon}</div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 flex items-center justify-center space-x-8 text-white/60 text-sm"
        >
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Trusted by 50K+ travelers</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI-powered recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span>195 countries covered</span>
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">How Wanderlust Works</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="text-white/60 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-white/80">Demo video would play here</p>
                <p className="text-white/60 text-sm mt-2">Showing the complete trip planning process</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;