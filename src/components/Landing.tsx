import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Play, Globe, Users, Star, Search, MapPin, Calendar, DollarSign, ChevronDown, Brain, Bot, Shuffle } from 'lucide-react';
import { MorphingText } from './magicui/morphing-text';
import { moods } from '../data/moods';
import { destinations } from '../data/destinations';
import { useDestinationSearch } from '../hooks/useExternalAPIs';
import { useSpring, animated } from 'react-spring';
import { motion } from 'framer-motion';

interface LandingProps {
  onGetStarted: () => void;
  onExplore: () => void;
  onStories: () => void;
}

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  selectedMood: string;
}

interface LiveActivity {
  id: string;
  user: string;
  action: string;
  destination: string;
  timeAgo: string;
  avatar: string;
}

const taglines = [
  "Life is short. The world is wide.",
  "Adventure awaits around every corner.",
  "Create memories that last forever.",
  "Your next great story starts here.",
  "Discover the extraordinary in every journey.",
  "Turn wanderlust into wonder-filled adventures."
];

const aiLoadingMessages = [
  "🧠 Analyzing your travel style...",
  "🌍 Finding hidden gems...",
  "💰 Optimizing your budget...",
  "🎯 Matching perfect activities...",
  "📍 Creating your route...",
  "✨ Adding magical moments...",
  "🎨 Personalizing your experience...",
  "🌟 Almost ready! Final touches..."
];

const sampleItineraries = [
  {
    destination: "Tokyo, Japan",
    mood: "culture",
    days: 7,
    budget: 3500,
    highlights: ["Senso-ji Temple", "Tsukiji Market", "Robot Restaurant", "Mount Fuji Day Trip"],
    image: "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    destination: "Bali, Indonesia", 
    mood: "relaxation",
    days: 5,
    budget: 1800,
    highlights: ["Beach Yoga", "Spa Treatments", "Rice Terraces", "Sunset Dinner"],
    image: "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    destination: "Paris, France",
    mood: "romantic",
    days: 4,
    budget: 2800,
    highlights: ["Eiffel Tower", "Seine Cruise", "Louvre Museum", "Montmartre Walk"],
    image: "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

export default function Landing({ onGetStarted, onExplore, onStories }: LandingProps) {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 2500,
    travelers: 2,
    selectedMood: ''
  });

  const [showDestinations, setShowDestinations] = useState(false);
  const [showMoods, setShowMoods] = useState(false);
  const [showAIDemo, setShowAIDemo] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(0);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [showQuickPick, setShowQuickPick] = useState(false);
  const [randomDestination, setRandomDestination] = useState('');

  const { searchDestination, searchResults, clearSearch } = useDestinationSearch();
  const heroRef = useRef<HTMLDivElement>(null);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  // Generate live activities
  useEffect(() => {
    const activities: LiveActivity[] = [
      { id: '1', user: 'Sarah', action: 'just planned a trip to', destination: 'Tokyo', timeAgo: '2m ago', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50' },
      { id: '2', user: 'Marco', action: 'completed an adventure in', destination: 'Patagonia', timeAgo: '5m ago', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50' },
      { id: '3', user: 'Emma', action: 'shared a story from', destination: 'Bali', timeAgo: '8m ago', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=50' },
      { id: '4', user: 'Alex', action: 'discovered a hidden gem in', destination: 'Prague', timeAgo: '12m ago', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=50' }
    ];
    setLiveActivities(activities);
  }, []);

  // Rotate sample itineraries
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItinerary(prev => (prev + 1) % sampleItineraries.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // AI Demo simulation
  useEffect(() => {
    if (showAIDemo) {
      const interval = setInterval(() => {
        setAiLoadingStep(prev => {
          if (prev >= aiLoadingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setShowAIDemo(false);
              onGetStarted();
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [showAIDemo, onGetStarted]);

  const handleDestinationSearch = (value: string) => {
    setFormData(prev => ({ ...prev, destination: value }));
    if (value.length >= 2) {
      searchDestination(value);
      setShowDestinations(true);
    } else {
      clearSearch();
      setShowDestinations(false);
    }
  };

  const selectDestination = (destination: any) => {
    setFormData(prev => ({ ...prev, destination: destination.displayName || destination.name }));
    setShowDestinations(false);
    clearSearch();
  };

  const selectMood = (moodId: string) => {
    setFormData(prev => ({ ...prev, selectedMood: moodId }));
    setShowMoods(false);
  };

  const handleQuickPick = () => {
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    const randomMoodData = moods[Math.floor(Math.random() * moods.length)];
    
    setFormData(prev => ({
      ...prev,
      destination: `${randomDest.name}, ${randomDest.country}`,
      selectedMood: randomMoodData.id,
      budget: Math.floor(Math.random() * 4000) + 1500
    }));
    
    setRandomDestination(`${randomDest.name}, ${randomDest.country}`);
    setShowQuickPick(true);
    
    setTimeout(() => {
      setShowQuickPick(false);
      handleSmartPlan();
    }, 2000);
  };

  const handleSmartPlan = () => {
    if (!formData.destination || !formData.selectedMood) {
      alert('Please select a destination and travel style!');
      return;
    }
    setShowAIDemo(true);
    setAiLoadingStep(0);
  };

  const formatBudget = (budget: number) => {
    return budget >= 1000 ? `$${(budget / 1000).toFixed(1)}k` : `$${budget}`;
  };

  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const heroAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(30px)' },
    config: { tension: 300, friction: 30 }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-400/20 via-pink-500/20 to-blue-600/20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="text-white font-bold text-xl" style={{ fontFamily: 'Fredoka One, cursive' }}>
                Wanderlust
              </span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-white/80 hover:text-white transition-colors duration-200">Home</a>
              <button onClick={onExplore} className="text-white/80 hover:text-white transition-colors duration-200">Explore</button>
              <button onClick={onStories} className="text-white/80 hover:text-white transition-colors duration-200">Stories</button>
              <a href="#about" className="text-white/80 hover:text-white transition-colors duration-200">About</a>
            </div>

            {/* Search & Auth */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchExpanded(!searchExpanded)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all duration-200">
                Sign In
              </button>
            </div>
          </div>

          {/* Expanded Search */}
          {searchExpanded && (
            <div className="pb-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search destinations, stories, or travelers..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Smart Trip Planner */}
      <animated.div ref={heroRef} style={heroAnimation} className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Fredoka One, cursive' }}>
              AI-Powered Travel Planning
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Made Magical
              </span>
            </h1>
            
            <div className="h-16 flex items-center justify-center mb-8">
              <MorphingText
                texts={taglines}
                className="text-xl sm:text-2xl text-white/90 font-medium"
                duration={3000}
              />
            </div>

            {/* Smart Trip Planning Interface */}
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Plan Your Perfect Trip in Minutes
                <Sparkles className="w-6 h-6 ml-3" />
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column - Form */}
                <div className="space-y-6">
                  
                  {/* Destination with Autocomplete */}
                  <div className="relative">
                    <label className="block text-white/90 text-sm font-medium mb-3">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Where do you want to go?
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => handleDestinationSearch(e.target.value)}
                        placeholder="Search destinations..."
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                      
                      {showDestinations && (
                        <div className="absolute z-20 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                          <div className="p-3 border-b border-white/10">
                            <div className="text-white/70 text-xs font-medium">POPULAR DESTINATIONS</div>
                          </div>
                          {destinations.slice(0, 6).map((dest, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectDestination(dest)}
                              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm">
                                🌍
                              </div>
                              <div>
                                <div className="font-medium">{dest.name}</div>
                                <div className="text-sm text-white/60">{dest.country}, {dest.region}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={formData.startDate}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                    </div>
                  </div>

                  {/* Budget Slider */}
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-3">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Budget ({formatBudget(formData.budget)})
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="250"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider mb-3"
                    />
                    <div className="flex justify-between text-white/60 text-sm">
                      <span>$500</span>
                      <span>$10k+</span>
                    </div>
                  </div>

                  {/* Travelers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-3">
                        <Users className="w-4 h-4 inline mr-2" />
                        Travelers
                      </label>
                      <select
                        value={formData.travelers}
                        onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num} className="bg-gray-800">
                            {num} {num === 1 ? 'Traveler' : 'Travelers'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <div className="bg-white/5 rounded-2xl p-3 w-full text-center">
                        <div className="text-white/70 text-sm">Duration</div>
                        <div className="text-white font-bold text-lg">{getDuration()} days</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Travel Style & Preview */}
                <div className="space-y-6">
                  
                  {/* Travel Style Selector */}
                  <div className="relative">
                    <label className="block text-white/90 text-sm font-medium mb-3">
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Travel Style
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMoods(!showMoods)}
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-between"
                    >
                      <span>
                        {formData.selectedMood ? (
                          <span className="flex items-center space-x-2">
                            <span>{moods.find(m => m.id === formData.selectedMood)?.emoji}</span>
                            <span>{moods.find(m => m.id === formData.selectedMood)?.name}</span>
                          </span>
                        ) : (
                          'Select your travel mood...'
                        )}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showMoods ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showMoods && (
                      <div className="absolute z-20 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                        <div className="p-4 grid grid-cols-1 gap-2">
                          {moods.map((mood) => (
                            <button
                              key={mood.id}
                              type="button"
                              onClick={() => selectMood(mood.id)}
                              className="flex items-center space-x-3 p-3 text-left text-white hover:bg-white/10 transition-colors duration-200 rounded-xl"
                            >
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${mood.gradient} flex items-center justify-center text-xl`}>
                                {mood.emoji}
                              </div>
                              <div>
                                <div className="font-semibold">{mood.name}</div>
                                <div className="text-sm text-white/70">{mood.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Preview */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trip Preview
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Destination:</span>
                        <span className="text-white">{formData.destination || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Duration:</span>
                        <span className="text-white">{getDuration()} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Budget:</span>
                        <span className="text-white">{formatBudget(formData.budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Style:</span>
                        <span className="text-white">
                          {formData.selectedMood ? moods.find(m => m.id === formData.selectedMood)?.name : 'Not selected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSmartPlan}
                  disabled={!formData.destination || !formData.selectedMood}
                  className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Generate My Perfect Trip</span>
                  <Sparkles className="w-6 h-6" />
                </button>
                
                <button
                  onClick={handleQuickPick}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Shuffle className="w-5 h-5" />
                  <span>Surprise Me!</span>
                </button>
              </div>

              {/* Secondary CTAs */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  onClick={onExplore}
                  className="text-white/80 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Explore Amazing Trips</span>
                </button>
                <button
                  onClick={onStories}
                  className="text-white/80 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Read Travel Stories</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </animated.div>

      {/* Quick Pick Generator Section */}
      <div className="relative z-10 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Not Sure Where to Go?</h2>
          <p className="text-xl text-white/80 mb-8">Let our AI surprise you with the perfect destination!</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              {moods.slice(0, 6).map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, selectedMood: mood.id }));
                    handleQuickPick();
                  }}
                  className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    formData.selectedMood === mood.id ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-white text-xs font-medium">{mood.name}</div>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleQuickPick}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 mx-auto"
            >
              <Shuffle className="w-6 h-6" />
              <span>Generate Random Adventure</span>
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Travelers Love Wanderlust</h2>
            <p className="text-xl text-white/80">Powered by AI, perfected by community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* AI-Personalized */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Personalized</h3>
              <p className="text-white/80 mb-4">Learns from 1M+ travelers to create your perfect itinerary</p>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Learning Progress</span>
                  <span className="text-green-400 text-sm font-medium">94%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-[94%] transition-all duration-1000"></div>
                </div>
              </div>
            </motion.div>

            {/* Smart Assistant */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Assistant</h3>
              <p className="text-white/80 mb-4">24/7 multilingual support for all your travel needs</p>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-sm">AI Assistant Online</span>
                </div>
                <div className="text-green-400 text-sm font-medium">Available in 12 languages</div>
              </div>
            </motion.div>

            {/* Community Driven */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Community Driven</h3>
              <p className="text-white/80 mb-4">50K+ verified stories from real travelers</p>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-white font-bold">50K+</div>
                    <div className="text-white/70">Stories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">4.9★</div>
                    <div className="text-white/70">Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Interface Preview */}
      <div className="relative z-10 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">See the Magic in Action</h2>
            <p className="text-xl text-white/80">From inspiration to itinerary in minutes</p>
          </div>

          {/* Interactive Demo */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Demo Steps */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">Your Journey to Perfect Travel</h3>
                
                {[
                  { step: 1, title: "Choose Your Vibe", desc: "Select from 9 travel moods", icon: "🎯", active: true },
                  { step: 2, title: "Smart Planning", desc: "AI analyzes preferences & weather", icon: "🧠", active: formData.selectedMood !== '' },
                  { step: 3, title: "Perfect Itinerary", desc: "Get personalized day-by-day plans", icon: "📋", active: false },
                  { step: 4, title: "Share & Export", desc: "Save, share, or export your trip", icon: "📤", active: false }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
                    item.active ? 'bg-white/10 border border-white/20' : 'bg-white/5'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      item.active ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-white/10'
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-white/70 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Itinerary Preview */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Sample Itinerary</h4>
                  <div className="flex space-x-1">
                    {sampleItineraries.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentItinerary(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentItinerary ? 'bg-orange-400 w-6' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <img
                    src={sampleItineraries[currentItinerary].image}
                    alt={sampleItineraries[currentItinerary].destination}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <div>
                    <h5 className="text-white font-semibold text-lg">{sampleItineraries[currentItinerary].destination}</h5>
                    <div className="flex items-center space-x-4 text-white/70 text-sm mt-2">
                      <span>{sampleItineraries[currentItinerary].days} days</span>
                      <span>${sampleItineraries[currentItinerary].budget.toLocaleString()}</span>
                      <span className="capitalize">{sampleItineraries[currentItinerary].mood}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {sampleItineraries[currentItinerary].highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2 text-white/80 text-sm">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Community Activity */}
      <div className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Join the Adventure</h2>
            <p className="text-xl text-white/80">See what fellow travelers are discovering right now</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Live Activity Feed */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-white font-semibold text-lg">Live Activity</h3>
              </div>
              
              <div className="space-y-4">
                {liveActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                    <div className="flex-1">
                      <p className="text-white/80 text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.destination}</span>
                      </p>
                      <p className="text-white/60 text-xs">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-6">Community Impact</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">127,543</div>
                  <div className="text-white/70">Trips Planned This Month</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">4.9★</div>
                    <div className="text-white/70 text-sm">Average Rating</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">89%</div>
                    <div className="text-white/70 text-sm">Satisfaction Rate</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium">Social Impact</span>
                  </div>
                  <p className="text-white/80 text-sm">$12,847 contributed to local communities this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Demo Modal */}
      {showAIDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full text-center">
            <div className="text-6xl mb-6 animate-bounce">🤖</div>
            <h2 className="text-3xl font-bold text-white mb-4">AI Magic in Progress</h2>
            <p className="text-xl text-white/80 mb-8">Creating your perfect {formData.selectedMood ? moods.find(m => m.id === formData.selectedMood)?.name.toLowerCase() : ''} adventure...</p>
            
            <div className="space-y-6">
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-300 to-orange-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((aiLoadingStep + 1) / aiLoadingMessages.length) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-lg text-white/90 h-8 flex items-center justify-center">
                {aiLoadingMessages[aiLoadingStep]}
              </p>
              
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-white/60 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Pick Animation */}
      {showQuickPick && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-md w-full text-center">
            <div className="text-6xl mb-6 animate-spin">🎲</div>
            <h2 className="text-2xl font-bold text-white mb-4">Picking Your Adventure!</h2>
            <p className="text-lg text-white/80 mb-6">
              Destination: <span className="font-semibold text-yellow-300">{randomDestination}</span>
            </p>
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 backdrop-blur-md border border-white/20 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
        >
          <Bot className="w-6 h-6" />
        </button>
        
        {showChatbot && (
          <div className="absolute bottom-16 right-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-80 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">AI Travel Buddy</h4>
                <p className="text-white/70 text-sm">Ask me anything about travel!</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {[
                "What's the best time to visit Japan?",
                "Help me plan a budget for Europe",
                "Find hidden gems in Thailand"
              ].map((question, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors duration-200"
                >
                  💬 {question}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
              <button className="bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg transition-colors duration-200">
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success & Export Preview */}
      <div className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Your Trip is Ready!</h2>
          <p className="text-xl text-white/80 mb-12">Export, share, and start your adventure</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* WhatsApp Share */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Share on WhatsApp</h3>
              <p className="text-white/70 text-sm mb-4">Send your itinerary to travel buddies instantly</p>
              <div className="bg-white/5 rounded-xl p-3 text-left">
                <div className="text-white/80 text-xs">
                  "🌟 Check out my amazing Tokyo trip!<br/>
                  📅 7 days of adventure<br/>
                  💰 Budget: $3,500<br/>
                  ✨ Planned with Wanderlust AI"
                </div>
              </div>
            </div>

            {/* PDF Export */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Export as PDF</h3>
              <p className="text-white/70 text-sm mb-4">Beautiful, printable itinerary with maps</p>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="w-full h-16 bg-white/10 rounded border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/60 text-xs">📄 Tokyo_Adventure.pdf</span>
                </div>
              </div>
            </div>

            {/* Copy Link */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Copy Trip Link</h3>
              <p className="text-white/70 text-sm mb-4">Share your public itinerary anywhere</p>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white/60 text-xs font-mono">
                  wanderlust.ai/trip/abc123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
            <div className="text-6xl mb-6">🌟</div>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Adventure?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of travelers who've discovered their perfect trips with AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white px-12 py-4 rounded-full text-xl font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Start Planning Now ✨
              </button>
              
              <button
                onClick={onExplore}
                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Explore Trips
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>50K+ Happy Travelers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>195 Countries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}