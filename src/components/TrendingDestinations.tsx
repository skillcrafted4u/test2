import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, DollarSign, Clock, Star, Users, Thermometer } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  avgCost: number;
  bestTime: string;
  rating: number;
  trendingScore: number;
  popularActivities: string[];
  avgTemperature: number;
  currency: string;
  timeZone: string;
  description: string;
}

interface TrendingDestinationsProps {
  onDestinationSelect?: (destination: Destination) => void;
  limit?: number;
  showDetails?: boolean;
}

const trendingDestinations: Destination[] = [
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600',
    avgCost: 3500,
    bestTime: 'Spring (Mar-May)',
    rating: 4.9,
    trendingScore: 95,
    popularActivities: ['Temples', 'Sushi', 'Shopping', 'Cherry Blossoms'],
    avgTemperature: 22,
    currency: 'JPY',
    timeZone: 'JST',
    description: 'A perfect blend of ancient traditions and cutting-edge technology'
  },
  {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600',
    avgCost: 2800,
    bestTime: 'Summer (Jun-Aug)',
    rating: 4.8,
    trendingScore: 92,
    popularActivities: ['Museums', 'Cafés', 'Architecture', 'Romance'],
    avgTemperature: 20,
    currency: 'EUR',
    timeZone: 'CET',
    description: 'The city of love, art, and unforgettable culinary experiences'
  },
  {
    id: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=600',
    avgCost: 1800,
    bestTime: 'Dry Season (Apr-Oct)',
    rating: 4.7,
    trendingScore: 88,
    popularActivities: ['Beaches', 'Temples', 'Yoga', 'Rice Terraces'],
    avgTemperature: 28,
    currency: 'IDR',
    timeZone: 'WITA',
    description: 'Tropical paradise with rich culture and stunning landscapes'
  },
  {
    id: 'new-york-usa',
    name: 'New York',
    country: 'USA',
    image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=600',
    avgCost: 4200,
    bestTime: 'Fall (Sep-Nov)',
    rating: 4.6,
    trendingScore: 85,
    popularActivities: ['Broadway', 'Museums', 'Food Scene', 'Skyline'],
    avgTemperature: 18,
    currency: 'USD',
    timeZone: 'EST',
    description: 'The city that never sleeps, full of endless possibilities'
  },
  {
    id: 'rome-italy',
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=600',
    avgCost: 2400,
    bestTime: 'Spring (Apr-Jun)',
    rating: 4.8,
    trendingScore: 82,
    popularActivities: ['History', 'Food', 'Art', 'Architecture'],
    avgTemperature: 21,
    currency: 'EUR',
    timeZone: 'CET',
    description: 'Eternal city where history comes alive at every corner'
  },
  {
    id: 'barcelona-spain',
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=600',
    avgCost: 2200,
    bestTime: 'Summer (Jun-Sep)',
    rating: 4.7,
    trendingScore: 79,
    popularActivities: ['Gaudí Architecture', 'Beaches', 'Tapas', 'Nightlife'],
    avgTemperature: 24,
    currency: 'EUR',
    timeZone: 'CET',
    description: 'Vibrant Mediterranean city with unique architecture and culture'
  }
];

const TrendingDestinations: React.FC<TrendingDestinationsProps> = ({ 
  onDestinationSelect, 
  limit = 6, 
  showDetails = true 
}) => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate featured destination
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(limit, trendingDestinations.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [limit]);

  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination);
    onDestinationSelect?.(destination);
  };

  const formatBudget = (budget: number) => {
    return budget >= 1000 ? `$${(budget / 1000).toFixed(1)}k` : `$${budget}`;
  };

  const displayDestinations = trendingDestinations.slice(0, limit);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Trending Destinations</h2>
        </div>
        <div className="text-white/60 text-sm">Updated hourly</div>
      </div>

      {/* Featured Destination */}
      {showDetails && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={displayDestinations[currentIndex]?.image}
                alt={displayDestinations[currentIndex]?.name}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                  🔥 #{currentIndex + 1} Trending
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white/80 text-sm">{displayDestinations[currentIndex]?.rating}</span>
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-2">
                {displayDestinations[currentIndex]?.name}
              </h3>
              <p className="text-white/70 text-lg mb-4">
                {displayDestinations[currentIndex]?.country}
              </p>
              <p className="text-white/80 mb-6">
                {displayDestinations[currentIndex]?.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white/70 text-sm">Avg. Budget</span>
                  </div>
                  <div className="text-white font-semibold">
                    {formatBudget(displayDestinations[currentIndex]?.avgCost || 0)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Thermometer className="w-4 h-4 text-blue-400" />
                    <span className="text-white/70 text-sm">Climate</span>
                  </div>
                  <div className="text-white font-semibold">
                    {displayDestinations[currentIndex]?.avgTemperature}°C avg
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {displayDestinations[currentIndex]?.popularActivities.map((activity, i) => (
                  <span key={i} className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm">
                    {activity}
                  </span>
                ))}
              </div>
              
              <button
                onClick={() => handleDestinationClick(displayDestinations[currentIndex])}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200"
              >
                Plan Trip to {displayDestinations[currentIndex]?.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destination Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDestinations.map((destination, index) => (
          <div
            key={destination.id}
            onClick={() => handleDestinationClick(destination)}
            className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="relative overflow-hidden">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Trending Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-orange-500/80 text-white text-sm px-3 py-1 rounded-full font-medium">
                  #{index + 1} Trending
                </div>
              </div>
              
              {/* Rating */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">{destination.rating}</span>
                </div>
              </div>
              
              {/* Destination Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-xl mb-1">{destination.name}</h3>
                <p className="text-white/80 text-sm">{destination.country}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-white/70">
                  <DollarSign className="w-4 h-4" />
                  <span>Avg. {formatBudget(destination.avgCost)}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70">
                  <Clock className="w-4 h-4" />
                  <span>{destination.bestTime.split(' ')[0]}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70">
                  <Thermometer className="w-4 h-4" />
                  <span>{destination.avgTemperature}°C</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70">
                  <TrendingUp className="w-4 h-4" />
                  <span>{destination.trendingScore}% hot</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {destination.popularActivities.slice(0, 3).map((activity, i) => (
                    <span key={i} className="bg-white/10 text-white/70 px-2 py-1 rounded-lg text-xs">
                      {activity}
                    </span>
                  ))}
                  {destination.popularActivities.length > 3 && (
                    <span className="text-white/60 text-xs px-2 py-1">
                      +{destination.popularActivities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Destination indicators for featured rotation */}
      {showDetails && (
        <div className="flex justify-center space-x-2">
          {displayDestinations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-orange-400 w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingDestinations;