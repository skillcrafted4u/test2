import React, { useState, useEffect } from 'react';
import { Brain, Zap, Users, Star, TrendingUp, MapPin, Calendar, DollarSign, Clock, Sparkles, ArrowRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureShowcaseProps {
  className?: string;
}

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  duration: number;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ className = '' }) => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const demoSteps: DemoStep[] = [
    {
      id: 'mood-selection',
      title: 'Choose Your Travel Vibe',
      description: 'Select from 9 carefully crafted travel moods that match your personality',
      icon: <Sparkles className="w-6 h-6" />,
      preview: (
        <div className="grid grid-cols-3 gap-3">
          {['🏔️', '🏖️', '🏛️', '🍜', '🌿', '💕'].map((emoji, i) => (
            <div key={i} className={`p-4 rounded-xl transition-all duration-300 ${i === 1 ? 'bg-white/20 scale-110' : 'bg-white/10'}`}>
              <div className="text-2xl text-center">{emoji}</div>
            </div>
          ))}
        </div>
      ),
      duration: 3000
    },
    {
      id: 'ai-processing',
      title: 'AI Analyzes Your Preferences',
      description: 'Our AI considers weather, budget, activities, and local insights',
      icon: <Brain className="w-6 h-6" />,
      preview: (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm">Analyzing weather patterns...</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            <span className="text-white/80 text-sm">Finding local experiences...</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-500"></div>
            <span className="text-white/80 text-sm">Optimizing your budget...</span>
          </div>
        </div>
      ),
      duration: 4000
    },
    {
      id: 'itinerary-generation',
      title: 'Perfect Itinerary Created',
      description: 'Day-by-day plans with activities, restaurants, and hidden gems',
      icon: <Calendar className="w-6 h-6" />,
      preview: (
        <div className="space-y-3">
          {['Day 1: Arrival & Exploration', 'Day 2: Cultural Immersion', 'Day 3: Adventure Time'].map((day, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <span className="text-white/80 text-sm">{day}</span>
            </div>
          ))}
        </div>
      ),
      duration: 3000
    },
    {
      id: 'customization',
      title: 'Edit & Customize',
      description: 'Drag, drop, and modify activities to match your perfect trip',
      icon: <Zap className="w-6 h-6" />,
      preview: (
        <div className="space-y-2">
          <div className="p-3 bg-white/10 rounded-xl border-2 border-dashed border-white/30">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">🏛️</div>
              <span className="text-white/80 text-sm">Visit Local Museum</span>
            </div>
          </div>
          <div className="p-3 bg-white/20 rounded-xl border-2 border-white/40 transform scale-105">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">🍜</div>
              <span className="text-white text-sm font-medium">Street Food Tour</span>
            </div>
          </div>
        </div>
      ),
      duration: 3000
    }
  ];

  // Auto-advance demo
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveDemo(current => (current + 1) % demoSteps.length);
          return 0;
        }
        return prev + (100 / (demoSteps[activeDemo].duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeDemo, isPlaying, demoSteps]);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Intelligence",
      description: "Advanced algorithms analyze millions of travel patterns to create your perfect itinerary",
      stats: "Learns from 1M+ travelers",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Planning",
      description: "Generate complete itineraries in under 30 seconds with real-time optimization",
      stats: "Average: 23 seconds",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Verified",
      description: "Every recommendation is backed by real traveler reviews and experiences",
      stats: "50K+ verified stories",
      color: "from-green-400 to-teal-500"
    }
  ];

  return (
    <div className={`py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Experience the Future of Travel Planning
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Watch how our AI transforms your travel dreams into perfectly crafted adventures
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Interactive Demo */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Live Demo</h3>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>
            </div>

            {/* Demo Steps Navigation */}
            <div className="flex space-x-2 mb-6">
              {demoSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveDemo(index);
                    setProgress(0);
                  }}
                  className={`flex-1 p-3 rounded-xl transition-all duration-300 ${
                    activeDemo === index ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {step.icon}
                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Active Demo Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    {demoSteps[activeDemo].icon}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{demoSteps[activeDemo].title}</h4>
                    <p className="text-white/70 text-sm">{demoSteps[activeDemo].description}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  {demoSteps[activeDemo].preview}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-2">{feature.title}</h3>
                    <p className="text-white/80 mb-3 leading-relaxed">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm font-medium">{feature.stats}</span>
                      <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">127K+</div>
              <div className="text-white/70">Trips Planned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">4.9★</div>
              <div className="text-white/70">User Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">195</div>
              <div className="text-white/70">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">23s</div>
              <div className="text-white/70">Avg. Planning Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;