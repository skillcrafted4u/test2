import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Heart, Bookmark, Share2, QrCode, MapPin, Clock, DollarSign, Users, Star, TrendingUp, Eye, Copy, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTripSharing } from '../hooks/useTripSharing';
import { TripDetails, Mood } from '../types';
import { moods } from '../data/moods';
import LazyImage from './LazyImage';

interface PublicTrip {
  id: string;
  title: string;
  destination: string;
  description: string;
  coverImage: string;
  duration: number;
  budget: number;
  currency: string;
  travelers: number;
  selectedMoods: string[];
  creator: {
    id: string;
    name: string;
    avatar: string;
    tripsCount: number;
    followersCount: number;
  };
  stats: {
    loves: number;
    saves: number;
    views: number;
    rating: number;
  };
  isLoved: boolean;
  isSaved: boolean;
  isPublic: boolean;
  difficulty: 'easy' | 'moderate' | 'challenging';
  createdAt: string;
  tags: string[];
}

interface FilterState {
  search: string;
  moods: string[];
  budgetRange: [number, number];
  duration: string;
  difficulty: string;
  sortBy: 'recent' | 'popular' | 'rating';
}

const TripGallery: React.FC = () => {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<PublicTrip | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver>();
  
  const { user } = useAuth();
  const { shareTrip, loveTrip, saveTrip, followCreator } = useTripSharing();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    moods: [],
    budgetRange: [0, 10000],
    duration: '',
    difficulty: '',
    sortBy: 'recent'
  });

  // Mock data for demonstration
  const generateMockTrips = (): PublicTrip[] => {
    const destinations = [
      'Tokyo, Japan', 'Paris, France', 'Bali, Indonesia', 'New York, USA',
      'Rome, Italy', 'Barcelona, Spain', 'Bangkok, Thailand', 'London, UK',
      'Sydney, Australia', 'Dubai, UAE', 'Amsterdam, Netherlands', 'Prague, Czech Republic'
    ];

    const creators = [
      { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', tripsCount: 12, followersCount: 1240 },
      { name: 'Marco Silva', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', tripsCount: 8, followersCount: 890 },
      { name: 'Emma Johnson', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100', tripsCount: 15, followersCount: 2100 },
      { name: 'Alex Kim', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100', tripsCount: 6, followersCount: 567 }
    ];

    const difficulties = ['easy', 'moderate', 'challenging'] as const;
    const moodIds = moods.map(m => m.id);

    return Array.from({ length: 50 }, (_, i) => {
      const destination = destinations[i % destinations.length];
      const creator = creators[i % creators.length];
      const selectedMoods = moodIds.slice(0, Math.floor(Math.random() * 3) + 1);
      
      return {
        id: `trip-${i}`,
        title: `Amazing ${selectedMoods[0]} Adventure`,
        destination,
        description: `Discover the magic of ${destination} with this carefully crafted itinerary. Perfect for ${selectedMoods.join(', ')} lovers!`,
        coverImage: `https://images.pexels.com/photos/${1000000 + i}/pexels-photo-${1000000 + i}.jpeg?auto=compress&cs=tinysrgb&w=400`,
        duration: Math.floor(Math.random() * 14) + 3,
        budget: Math.floor(Math.random() * 5000) + 1000,
        currency: 'USD',
        travelers: Math.floor(Math.random() * 4) + 1,
        selectedMoods,
        creator: {
          id: `creator-${i % creators.length}`,
          ...creator
        },
        stats: {
          loves: Math.floor(Math.random() * 500) + 10,
          saves: Math.floor(Math.random() * 200) + 5,
          views: Math.floor(Math.random() * 2000) + 100,
          rating: 4.0 + Math.random() * 1.0
        },
        isLoved: Math.random() > 0.7,
        isSaved: Math.random() > 0.8,
        isPublic: true,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['trending', 'featured', 'new'].filter(() => Math.random() > 0.7)
      };
    });
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockTrips = generateMockTrips();
      setTrips(mockTrips);
      setFilteredTrips(mockTrips.slice(0, 12));
      setLoading(false);
    }, 1000);
  }, []);

  // Filter trips based on current filters
  useEffect(() => {
    let filtered = [...trips];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(trip =>
        trip.destination.toLowerCase().includes(filters.search.toLowerCase()) ||
        trip.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        trip.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Mood filter
    if (filters.moods.length > 0) {
      filtered = filtered.filter(trip =>
        trip.selectedMoods.some(mood => filters.moods.includes(mood))
      );
    }

    // Budget filter
    filtered = filtered.filter(trip =>
      trip.budget >= filters.budgetRange[0] && trip.budget <= filters.budgetRange[1]
    );

    // Duration filter
    if (filters.duration) {
      const [min, max] = filters.duration.split('-').map(Number);
      filtered = filtered.filter(trip =>
        trip.duration >= min && (max ? trip.duration <= max : true)
      );
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(trip => trip.difficulty === filters.difficulty);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return b.stats.loves - a.stats.loves;
        case 'rating':
          return b.stats.rating - a.stats.rating;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredTrips(filtered.slice(0, page * 12));
  }, [trips, filters, page]);

  // Infinite scroll
  const lastTripElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  const handleLove = async (tripId: string) => {
    if (!user) return;
    
    setFilteredTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { 
            ...trip, 
            isLoved: !trip.isLoved,
            stats: { 
              ...trip.stats, 
              loves: trip.isLoved ? trip.stats.loves - 1 : trip.stats.loves + 1 
            }
          }
        : trip
    ));
  };

  const handleSave = async (tripId: string) => {
    if (!user) return;
    
    setFilteredTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { 
            ...trip, 
            isSaved: !trip.isSaved,
            stats: { 
              ...trip.stats, 
              saves: trip.isSaved ? trip.stats.saves - 1 : trip.stats.saves + 1 
            }
          }
        : trip
    ));
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🏖️';
      case 'moderate': return '🏔️';
      case 'challenging': return '⛰️';
      default: return '🗺️';
    }
  };

  const getMoodEmoji = (moodId: string) => {
    const mood = moods.find(m => m.id === moodId);
    return mood?.emoji || '✨';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 animate-pulse">
                <div className="w-full h-48 bg-white/20 rounded-2xl mb-4"></div>
                <div className="h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                  <div className="h-4 bg-white/20 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ✨ Explore Amazing Trips
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover incredible journeys crafted by fellow travelers. Get inspired and plan your next adventure!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search destinations, moods, or creators..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all duration-200"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-white/10 border border-white/20 rounded-2xl text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="recent" className="bg-gray-800">Most Recent</option>
              <option value="popular" className="bg-gray-800">Most Loved</option>
              <option value="rating" className="bg-gray-800">Highest Rated</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Moods */}
              <div>
                <label className="block text-white font-medium mb-3">Travel Moods</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {moods.map(mood => (
                    <label key={mood.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.moods.includes(mood.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, moods: [...prev.moods, mood.id] }));
                          } else {
                            setFilters(prev => ({ ...prev, moods: prev.moods.filter(m => m !== mood.id) }));
                          }
                        }}
                        className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-white/80 text-sm">{mood.emoji} {mood.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-white font-medium mb-3">Budget Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={filters.budgetRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      budgetRange: [prev.budgetRange[0], parseInt(e.target.value)] 
                    }))}
                    className="w-full"
                  />
                  <div className="text-white/80 text-sm">
                    Up to ${filters.budgetRange[1].toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-white font-medium mb-3">Trip Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <option value="" className="bg-gray-800">Any Duration</option>
                  <option value="1-3" className="bg-gray-800">1-3 days</option>
                  <option value="4-7" className="bg-gray-800">4-7 days</option>
                  <option value="8-14" className="bg-gray-800">1-2 weeks</option>
                  <option value="15" className="bg-gray-800">2+ weeks</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-white font-medium mb-3">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <option value="" className="bg-gray-800">Any Difficulty</option>
                  <option value="easy" className="bg-gray-800">🏖️ Easy</option>
                  <option value="moderate" className="bg-gray-800">🏔️ Moderate</option>
                  <option value="challenging" className="bg-gray-800">⛰️ Challenging</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Trending Destinations</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {['Tokyo', 'Paris', 'Bali', 'New York', 'Rome'].map((destination, index) => (
              <div
                key={destination}
                className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <div className="text-white font-semibold">{destination}</div>
                    <div className="text-white/70 text-sm">{Math.floor(Math.random() * 50) + 10} trips</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trip Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrips.map((trip, index) => (
            <div
              key={trip.id}
              ref={index === filteredTrips.length - 1 ? lastTripElementRef : null}
              className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              {/* Cover Image */}
              <div className="relative overflow-hidden">
                <LazyImage
                  src={trip.coverImage}
                  alt={trip.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                  <button
                    onClick={() => handleLove(trip.id)}
                    className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                      trip.isLoved ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-red-500/80'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${trip.isLoved ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleSave(trip.id)}
                    className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                      trip.isSaved ? 'bg-blue-500/80 text-white' : 'bg-white/20 text-white hover:bg-blue-500/80'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${trip.isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Tags */}
                <div className="absolute top-3 left-3 flex space-x-2">
                  {trip.tags.includes('trending') && (
                    <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      🔥 Trending
                    </span>
                  )}
                  {trip.tags.includes('new') && (
                    <span className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      ✨ New
                    </span>
                  )}
                </div>

                {/* Difficulty */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full border border-white/20">
                    {getDifficultyIcon(trip.difficulty)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title and Destination */}
                <div className="mb-3">
                  <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                    {trip.title}
                  </h3>
                  <div className="flex items-center text-white/70 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trip.destination}
                  </div>
                </div>

                {/* Moods */}
                <div className="flex items-center space-x-1 mb-3">
                  {trip.selectedMoods.slice(0, 3).map(moodId => (
                    <span key={moodId} className="text-lg">
                      {getMoodEmoji(moodId)}
                    </span>
                  ))}
                  {trip.selectedMoods.length > 3 && (
                    <span className="text-white/60 text-sm">+{trip.selectedMoods.length - 3}</span>
                  )}
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-white/70">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {trip.duration} days
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {trip.currency} {trip.budget.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {trip.travelers} travelers
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    {trip.stats.rating.toFixed(1)}
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={trip.creator.avatar}
                      alt={trip.creator.name}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                    <div>
                      <div className="text-white text-sm font-medium">{trip.creator.name}</div>
                      <div className="text-white/60 text-xs">{trip.creator.tripsCount} trips</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-3 text-white/60 text-sm">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{trip.stats.loves}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{trip.stats.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 text-white/70">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Loading more amazing trips...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTrips.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No trips found</h3>
            <p className="text-white/70 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => setFilters({
                search: '',
                moods: [],
                budgetRange: [0, 10000],
                duration: '',
                difficulty: '',
                sortBy: 'recent'
              })}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl transition-all duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripGallery;