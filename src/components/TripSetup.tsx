import React, { useState, useRef, useEffect } from 'react';
import { TripDetails, Mood } from '../types';
import { destinations } from '../data/destinations';
import { Calendar, Users, DollarSign, Search, MapPin, ChevronDown, Sparkles } from 'lucide-react';

interface TripSetupProps {
  selectedMood: Mood;
  onTripSubmit: (tripDetails: TripDetails) => void;
}

export default function TripSetup({ selectedMood, onTripSubmit }: TripSetupProps) {
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 2000,
    currency: 'USD',
    travelers: 2,
    selectedMood
  });
  
  const [destinationSuggestions, setDestinationSuggestions] = useState<typeof destinations>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const destinationRef = useRef<HTMLInputElement>(null);
  
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  useEffect(() => {
    // Set default dates (today and 7 days from today)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setTripDetails(prev => ({
      ...prev,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  const handleDestinationChange = (value: string) => {
    setTripDetails(prev => ({ ...prev, destination: value }));
    
    if (value.length > 0) {
      const filtered = destinations.filter(dest =>
        dest.name.toLowerCase().includes(value.toLowerCase()) ||
        dest.country.toLowerCase().includes(value.toLowerCase())
      );
      setDestinationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectDestination = (destination: typeof destinations[0]) => {
    setTripDetails(prev => ({ ...prev, destination: `${destination.name}, ${destination.country}` }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTripSubmit(tripDetails);
  };

  const formatBudget = (budget: number, currency: string) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$' };
    return `${symbols[currency as keyof typeof symbols] || '$'}${budget.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">{selectedMood.emoji}</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Perfect! Let's Plan Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              {selectedMood.name}
            </span>{' '}
            Adventure
          </h1>
          <p className="text-xl text-white/80">
            Share a few details and we'll craft something truly magical for you
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            
            {/* Destination */}
            <div className="relative mb-8">
              <label className="block text-white/90 text-lg font-medium mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Where do you want to go?
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  ref={destinationRef}
                  type="text"
                  value={tripDetails.destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  placeholder="Search destinations..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-lg"
                  required
                />
                
                {showSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                    {destinationSuggestions.slice(0, 6).map((dest, index) => (
                      <button
                        key={`${dest.name}-${index}`}
                        type="button"
                        onClick={() => selectDestination(dest)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <MapPin className="w-4 h-4 text-white/60" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-white/90 text-lg font-medium mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={tripDetails.startDate}
                  onChange={(e) => setTripDetails(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-white/90 text-lg font-medium mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  value={tripDetails.endDate}
                  onChange={(e) => setTripDetails(prev => ({ ...prev, endDate: e.target.value }))}
                  min={tripDetails.startDate}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-lg"
                  required
                />
              </div>
            </div>

            {/* Budget and Travelers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-white/90 text-lg font-medium mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Budget
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/90 flex items-center space-x-1 z-10"
                    >
                      <span className="font-medium">{tripDetails.currency}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={tripDetails.budget}
                      onChange={(e) => setTripDetails(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                      className="w-full pl-20 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-lg"
                      min="100"
                      step="100"
                      required
                    />
                    
                    {showCurrencyDropdown && (
                      <div className="absolute z-20 left-4 top-full mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl">
                        {currencies.map(currency => (
                          <button
                            key={currency}
                            type="button"
                            onClick={() => {
                              setTripDetails(prev => ({ ...prev, currency }));
                              setShowCurrencyDropdown(false);
                            }}
                            className="block w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {currency}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={tripDetails.budget}
                    onChange={(e) => setTripDetails(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-center text-white/80 text-lg font-medium">
                    {formatBudget(tripDetails.budget, tripDetails.currency)}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white/90 text-lg font-medium mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Travelers
                </label>
                <select
                  value={tripDetails.travelers}
                  onChange={(e) => setTripDetails(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm text-lg appearance-none cursor-pointer"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num} className="bg-gray-800">
                      {num} {num === 1 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="group bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white px-12 py-5 rounded-full text-xl font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <span className="flex items-center space-x-3">
                <span>Create My Perfect Trip</span>
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}