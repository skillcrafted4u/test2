import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, DollarSign, Users, Sparkles, Search, ChevronDown, TrendingUp, Star, Clock } from 'lucide-react';
import { useDestinationSearch } from '../hooks/useExternalAPIs';
import { moods } from '../data/moods';
import { destinations } from '../data/destinations';

interface SmartTripPlannerProps {
  onPlanTrip: (tripData: any) => void;
  className?: string;
}

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  selectedMood: string;
}

const SmartTripPlanner: React.FC<SmartTripPlannerProps> = ({ onPlanTrip, className = '' }) => {
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
  const [budgetRecommendation, setBudgetRecommendation] = useState('');
  
  const { searchDestination, searchResults, clearSearch } = useDestinationSearch();

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

  // Budget recommendations
  useEffect(() => {
    const selectedMoodData = moods.find(m => m.id === formData.selectedMood);
    if (selectedMoodData && formData.destination) {
      const isExpensiveDestination = ['Tokyo', 'Paris', 'New York', 'London'].some(city => 
        formData.destination.includes(city)
      );
      
      let recommendation = '';
      if (formData.budget < 1500) {
        recommendation = '💡 Consider increasing budget for better experiences';
      } else if (formData.budget > 5000) {
        recommendation = '✨ Perfect budget for luxury experiences!';
      } else if (isExpensiveDestination && formData.budget < 2500) {
        recommendation = '💰 This destination typically requires a higher budget';
      } else {
        recommendation = '👍 Great budget for this destination!';
      }
      
      setBudgetRecommendation(recommendation);
    }
  }, [formData.budget, formData.destination, formData.selectedMood]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination || !formData.selectedMood) {
      alert('Please select a destination and travel mood!');
      return;
    }
    onPlanTrip(formData);
  };

  const formatBudget = (budget: number) => {
    return budget >= 1000 ? `$${(budget / 1000).toFixed(1)}k` : `$${budget}`;
  };

  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days;
    }
    return 0;
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Smart Trip Planner</h2>
        <p className="text-white/80">AI-powered planning in just a few clicks</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Destination with Smart Suggestions */}
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
              onFocus={() => setShowDestinations(true)}
              placeholder="Search destinations..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              required
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

        {/* Dates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              required
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
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              required
            />
          </div>
        </div>

        {/* Budget Slider with Real-time Recommendations */}
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
          <div className="flex justify-between text-white/60 text-sm mb-2">
            <span>$500</span>
            <span>$10k+</span>
          </div>
          {budgetRecommendation && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/80 text-sm">{budgetRecommendation}</p>
            </div>
          )}
        </div>

        {/* Travelers and Duration Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              Travelers
            </label>
            <select
              value={formData.travelers}
              onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none cursor-pointer"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num} className="bg-gray-800">
                  {num} {num === 1 ? 'Traveler' : 'Travelers'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="bg-white/5 rounded-2xl p-4 w-full text-center">
              <div className="text-white/70 text-sm">Trip Duration</div>
              <div className="text-white font-bold text-xl">{getDuration()} days</div>
            </div>
          </div>
        </div>

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
                    className="flex items-center space-x-4 p-4 text-left text-white hover:bg-white/10 transition-colors duration-200 rounded-xl"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${mood.gradient} flex items-center justify-center text-2xl`}>
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

        {/* Smart Recommendations */}
        {formData.destination && formData.selectedMood && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">AI Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">Best Time to Visit</span>
                </div>
                <p className="text-white text-sm">Spring (Mar-May) for perfect weather</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-white/80 text-sm">Optimal Duration</span>
                </div>
                <p className="text-white text-sm">{getDuration()} days is perfect for this mood</p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!formData.destination || !formData.selectedMood}
          className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white py-4 px-6 rounded-2xl text-lg font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center space-x-3">
            <Sparkles className="w-6 h-6" />
            <span>Generate My Perfect Trip</span>
            <Sparkles className="w-6 h-6" />
          </span>
        </button>
      </form>
    </div>
  );

  function getDuration() {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }
};

export default SmartTripPlanner;