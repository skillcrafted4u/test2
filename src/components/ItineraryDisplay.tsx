import React, { useState, useCallback } from 'react';
import { TripDetails, DayItinerary, ItineraryItem } from '../types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSpring, animated } from 'react-spring';
import { Clock, MapPin, DollarSign, ChevronLeft, ChevronRight, Star, Edit3, Trash2, Plus, Shuffle, Sun, Cloud, CloudRain, SunSnow as Snow, ChevronDown, ChevronUp, Grip } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { useImpact } from '../hooks/useImpact';

interface ItineraryDisplayProps {
  tripDetails: TripDetails;
  onShare: () => void;
  onExport: () => void;
  onShowAIBuddy?: () => void;
  onShowPackingList?: () => void;
  onShowBudgetPlanner?: () => void;
}

// Enhanced mock itinerary generation with weather and images
const generateEnhancedItinerary = (tripDetails: TripDetails): DayItinerary[] => {
  const start = new Date(tripDetails.startDate);
  const end = new Date(tripDetails.endDate);
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const weatherConditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];
  const weatherIcons = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', 'partly-cloudy': '⛅' };
  
  const itinerary: DayItinerary[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    const weatherCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    const dayActivities: ItineraryItem[] = [
      {
        id: `day${i}-morning`,
        time: '09:00',
        title: i === 0 ? 'Arrival & Hotel Check-in' : 'Morning Adventure',
        description: i === 0 ? 'Arrive at destination, check into accommodation' : getMoodBasedActivity(tripDetails.selectedMood?.id || 'adventure', 'morning'),
        location: getLocationName(tripDetails.destination),
        type: i === 0 ? 'transport' : 'activity',
        duration: '2 hours',
        cost: Math.floor(Math.random() * 100) + 20,
        rating: 4.2 + Math.random() * 0.8,
        image: `https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400`,
        isEditable: true
      },
      {
        id: `day${i}-lunch`,
        time: '12:30',
        title: 'Local Cuisine Experience',
        description: getLunchDescription(tripDetails.selectedMood?.id || 'adventure'),
        location: 'Local Restaurant District',
        type: 'restaurant',
        duration: '1.5 hours',
        cost: Math.floor(Math.random() * 80) + 30,
        rating: 4.0 + Math.random() * 1.0,
        image: `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400`,
        isEditable: true
      },
      {
        id: `day${i}-afternoon`,
        time: '15:00',
        title: 'Afternoon Exploration',
        description: getMoodBasedActivity(tripDetails.selectedMood?.id || 'adventure', 'afternoon'),
        location: getLocationName(tripDetails.destination),
        type: 'attraction',
        duration: '3 hours',
        cost: Math.floor(Math.random() * 120) + 40,
        rating: 4.3 + Math.random() * 0.7,
        image: `https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400`,
        isEditable: true
      },
      {
        id: `day${i}-dinner`,
        time: '19:00',
        title: 'Evening Dining',
        description: getDinnerDescription(tripDetails.selectedMood?.id || 'adventure'),
        location: 'Premium Restaurant',
        type: 'restaurant',
        duration: '2 hours',
        cost: Math.floor(Math.random() * 150) + 50,
        rating: 4.4 + Math.random() * 0.6,
        image: `https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400`,
        isEditable: true
      }
    ];
    
    if (i === days - 1) {
      dayActivities.push({
        id: `day${i}-departure`,
        time: '11:00',
        title: 'Departure',
        description: 'Check out and head to airport/station',
        location: 'Hotel → Airport',
        type: 'transport',
        duration: '2 hours',
        cost: Math.floor(Math.random() * 60) + 20,
        rating: 4.0,
        isEditable: false
      });
    }
    
    itinerary.push({
      day: i + 1,
      date: date.toDateString(),
      items: dayActivities,
      weather: {
        condition: weatherCondition,
        temperature: Math.floor(Math.random() * 15) + 20,
        icon: weatherIcons[weatherCondition as keyof typeof weatherIcons]
      },
      isCollapsed: false
    });
  }
  
  return itinerary;
};

// Helper functions for generating content
const getMoodBasedActivity = (mood: string, timeOfDay: string) => {
  const activities: Record<string, Record<string, string>> = {
    adventure: {
      morning: 'Thrilling outdoor activity - rock climbing, hiking, or zip-lining',
      afternoon: 'Adrenaline-pumping water sports or mountain biking adventure'
    },
    relaxation: {
      morning: 'Peaceful spa session with traditional treatments',
      afternoon: 'Gentle yoga class overlooking scenic views'
    },
    culture: {
      morning: 'Guided tour of historic landmarks and museums',
      afternoon: 'Art gallery visit and cultural workshop'
    },
    food: {
      morning: 'Food market tour and cooking class',
      afternoon: 'Wine tasting and culinary walking tour'
    },
    luxury: {
      morning: 'Private guided tour with premium service',
      afternoon: 'Exclusive shopping experience in high-end districts'
    },
    spontaneous: {
      morning: 'Mystery activity - let the day surprise you!',
      afternoon: 'Random local discovery adventure'
    }
  };
  
  return activities[mood]?.[timeOfDay] || 'Explore local attractions and hidden gems';
};

const getLunchDescription = (mood: string) => {
  const descriptions: Record<string, string> = {
    adventure: 'Quick energy meal at a local adventure café',
    relaxation: 'Healthy, organic meal at a peaceful garden restaurant', 
    culture: 'Traditional cuisine at a historic local establishment',
    food: 'Multi-course tasting menu at a renowned local restaurant',
    luxury: 'Fine dining experience at a Michelin-starred restaurant',
    spontaneous: 'Surprise restaurant chosen by locals'
  };
  return descriptions[mood] || 'Delicious local specialties at a popular restaurant';
};

const getDinnerDescription = (mood: string) => {
  const descriptions: Record<string, string> = {
    adventure: 'Hearty meal at a rustic local tavern',
    relaxation: 'Candlelit dinner with sunset views',
    culture: 'Traditional feast with live cultural performances',
    food: 'Chef\'s special tasting menu with wine pairings',
    luxury: 'Exclusive dining experience with premium service',
    spontaneous: 'Mystery dinner at a hidden local gem'
  };
  return descriptions[mood] || 'Memorable dinner at a top-rated local restaurant';
};

const getLocationName = (destination: string) => {
  const city = destination.split(',')[0];
  return `${city} City Center`;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    attraction: '🏛️',
    restaurant: '🍽️',
    activity: '🎯',
    transport: '🚗'
  };
  return icons[type] || '📍';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    attraction: 'from-blue-400 to-purple-500',
    restaurant: 'from-orange-400 to-red-500',
    activity: 'from-green-400 to-teal-500',
    transport: 'from-gray-400 to-gray-600'
  };
  return colors[type] || 'from-gray-400 to-gray-600';
};

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/80 mb-6">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-2xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white py-3 px-6 rounded-2xl transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ 
  tripDetails, 
  onShare, 
  onExport, 
  onShowAIBuddy,
  onShowPackingList,
  onShowBudgetPlanner 
}) => {
  const [itinerary, setItinerary] = useState<DayItinerary[]>(() => generateEnhancedItinerary(tripDetails));
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDragging, setIsDragging] = useState(false);
  
  const { updateActivityOrder, saveItinerary } = useTrips();
  const { recordImpact, totalImpact } = useImpact();
  
  const totalCost = itinerary.reduce((total, day) => 
    total + day.items.reduce((dayTotal, item) => dayTotal + (item.cost || 0), 0), 0
  );

  // Online/offline detection
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache itinerary to localStorage
  React.useEffect(() => {
    localStorage.setItem('cached_itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  // Record social impact
  React.useEffect(() => {
    const impactAmount = totalCost * 0.01; // 1% of budget
    recordImpact('trip-id', impactAmount);
  }, [totalCost, recordImpact]);

  // Drag and drop handler
  const handleDragEnd = useCallback(async (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    setItinerary(prev => {
      const newItinerary = [...prev];
      const currentDay = newItinerary[selectedDay];
      const [reorderedItem] = currentDay.items.splice(sourceIndex, 1);
      currentDay.items.splice(destinationIndex, 0, reorderedItem);
      return newItinerary;
    });
    
    // Auto-save to Supabase if online
    if (isOnline) {
      try {
        await updateActivityOrder('trip-id', selectedDay + 1, itinerary[selectedDay].items);
      } catch (error) {
        console.error('Failed to save reorder:', error);
      }
    }
  }, [selectedDay, updateActivityOrder, itinerary, isOnline]);

  const handleDeleteItem = (itemId: string) => {
    setItinerary(prev => {
      const newItinerary = [...prev];
      const currentDay = newItinerary[selectedDay];
      currentDay.items = currentDay.items.filter(item => item.id !== itemId);
      return newItinerary;
    });
    setShowDeleteModal(null);
  };

  const handleSurpriseMe = () => {
    // Add a random activity to the current day
    const surpriseActivities = [
      { title: 'Hidden Local Gem', description: 'Discover a secret spot only locals know about', type: 'attraction' as const },
      { title: 'Street Food Adventure', description: 'Try authentic street food from a popular vendor', type: 'restaurant' as const },
      { title: 'Spontaneous Activity', description: 'Let serendipity guide your next adventure', type: 'activity' as const }
    ];
    
    const randomActivity = surpriseActivities[Math.floor(Math.random() * surpriseActivities.length)];
    const newItem: ItineraryItem = {
      id: `surprise-${Date.now()}`,
      time: '16:00',
      title: randomActivity.title,
      description: randomActivity.description,
      location: getLocationName(tripDetails.destination),
      type: randomActivity.type,
      duration: '2 hours',
      cost: Math.floor(Math.random() * 80) + 20,
      rating: 4.0 + Math.random() * 1.0,
      image: `https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400`,
      isEditable: true
    };

    setItinerary(prev => {
      const newItinerary = [...prev];
      newItinerary[selectedDay].items.push(newItem);
      return newItinerary;
    });
  };

  const toggleDayCollapse = (dayIndex: number) => {
    setItinerary(prev => {
      const newItinerary = [...prev];
      newItinerary[dayIndex].isCollapsed = !newItinerary[dayIndex].isCollapsed;
      return newItinerary;
    });
  };

  // Animation for day cards
  const dayAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
  });

  return (
    <>
      <div className="min-h-screen px-4 pt-24 pb-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6 animate-bounce">{tripDetails.selectedMood?.emoji}</div>
          
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-2xl text-orange-200 text-sm inline-block">
              📱 You're offline - changes will sync when connection is restored
            </div>
          )}
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Your Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              {tripDetails.selectedMood?.name}
            </span>{' '}
            Journey
          </h1>
          <p className="text-xl text-white/80 mb-6">
            📍 {tripDetails.destination} • ⏰ {itinerary.length} days • 👥 {tripDetails.travelers} travelers
          </p>
          
          {/* Social Impact Display */}
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl inline-block">
            <div className="flex items-center space-x-3 text-green-200">
              <span className="text-2xl">🌱</span>
              <div>
                <div className="font-semibold">${(totalCost * 0.01).toFixed(2)} Social Impact</div>
                <div className="text-sm opacity-80">1% of your budget supports local communities</div>
              </div>
            </div>
          </div>
          
          {/* Trip Summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 inline-block">
            <div className="flex items-center justify-center space-x-8 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">{tripDetails.currency} {totalCost.toLocaleString()}</div>
                <div className="text-white/70 text-sm">Estimated Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{itinerary.length}</div>
                <div className="text-white/70 text-sm">Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  4.9
                </div>
                <div className="text-white/70 text-sm">Rating</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Day Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Trip Days</h3>
                <button
                  onClick={handleSurpriseMe}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white p-2 rounded-full transition-all duration-200 group"
                  title="Surprise Me!"
                >
                  <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
              <div className="space-y-2">
                {itinerary.map((day, index) => (
                  <div key={index} className="space-y-2">
                    <button
                      onClick={() => setSelectedDay(index)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                        selectedDay === index 
                          ? 'bg-white/20 text-white shadow-lg' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Day {day.day}</div>
                          <div className="text-sm opacity-80">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{day.weather?.icon}</span>
                          <span className="text-sm">{day.weather?.temperature}°</span>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => toggleDayCollapse(index)}
                      className="w-full flex items-center justify-center py-2 text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {day.isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Itinerary Content */}
          <div className="lg:col-span-3">
            <animated.div style={dayAnimation} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              
              {/* Day Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                    Day {itinerary[selectedDay].day}
                    <span className="ml-4 text-2xl">{itinerary[selectedDay].weather?.icon}</span>
                    <span className="ml-2 text-lg text-white/80">{itinerary[selectedDay].weather?.temperature}°C</span>
                  </h2>
                  <p className="text-white/70 text-lg">
                    {new Date(itinerary[selectedDay].date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                    disabled={selectedDay === 0}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedDay(Math.min(itinerary.length - 1, selectedDay + 1))}
                    disabled={selectedDay === itinerary.length - 1}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Activities */}
              {!itinerary[selectedDay].isCollapsed && (
                <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setIsDragging(true)}>
                  <Droppable droppableId="activities">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-6 ${snapshot.isDraggingOver ? 'bg-white/5 rounded-2xl p-4' : ''}`}
                      >
                        {itinerary[selectedDay].items.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                            isDragDisabled={!item.isEditable}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:transform hover:scale-[1.02] ${
                                  snapshot.isDragging ? 'opacity-80 rotate-2 scale-105 shadow-2xl z-50' : ''
                                } ${isDragging && !snapshot.isDragging ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-start space-x-4">
                                  
                                  {/* Drag Handle & Time */}
                                  <div className="flex-shrink-0 text-center">
                                    <div className="text-white/80 font-semibold text-lg mb-2">{item.time}</div>
                                    <div 
                                      {...provided.dragHandleProps}
                                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center text-2xl shadow-lg relative ${item.isEditable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    >
                                      {getTypeIcon(item.type)}
                                      {item.isEditable && (
                                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <Grip className="w-3 h-3 text-white/60" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Image */}
                                  {item.image && (
                                    <div className="flex-shrink-0">
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Content */}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h3 className="text-white font-semibold text-xl mb-1 flex items-center">
                                          {item.title}
                                          {item.rating && (
                                            <div className="ml-3 flex items-center text-yellow-400">
                                              <Star className="w-4 h-4 mr-1" />
                                              <span className="text-sm text-white/80">{item.rating.toFixed(1)}</span>
                                            </div>
                                          )}
                                        </h3>
                                        <div className="flex items-center text-white/70 text-sm space-x-4">
                                          <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {item.location}
                                          </div>
                                          <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {item.duration}
                                          </div>
                                          {item.cost && (
                                            <div className="flex items-center">
                                              <DollarSign className="w-4 h-4 mr-1" />
                                              {tripDetails.currency} {item.cost}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {item.isEditable && (
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <button
                                            onClick={() => setEditingItem(item.id)}
                                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => setShowDeleteModal(item.id)}
                                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white transition-all duration-200"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-white/80 leading-relaxed">{item.description}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
                  
              {/* Add Activity Button */}
              <button
                onClick={handleSurpriseMe}
                className="w-full p-6 border-2 border-dashed border-white/20 rounded-2xl text-white/60 hover:text-white hover:border-white/40 transition-all duration-300 flex items-center justify-center space-x-3 group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                <span>Add Activity</span>
              </button>

              {/* Day Summary */}
              <div className="mt-8 p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {itinerary[selectedDay].items.reduce((total, item) => total + (item.cost || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-white/70 text-sm">Day Cost ({tripDetails.currency})</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{itinerary[selectedDay].items.length}</div>
                      <div className="text-white/70 text-sm">Activities</div>
                    </div>
                  </div>
                  <div className="text-white/70 text-sm">
                    ✨ Personalized for your {tripDetails.selectedMood?.name.toLowerCase()} mood
                  </div>
                </div>
              </div>
            </animated.div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-12 space-x-4">
          {/* AI Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {onShowAIBuddy && (
              <button
                onClick={onShowAIBuddy}
                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>🤖</span>
                <span>Chat with AI Buddy</span>
              </button>
            )}
            
            {onShowPackingList && (
              <button
                onClick={onShowPackingList}
                className="bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>🎒</span>
                <span>Smart Packing List</span>
              </button>
            )}
            
            {onShowBudgetPlanner && (
              <button
                onClick={onShowBudgetPlanner}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>💰</span>
                <span>Budget Optimizer</span>
              </button>
            )}
          </div>
          
          <button
            onClick={onShare}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105"
          >
            Share Trip ✈️
          </button>
          <button
            onClick={onExport}
            className="bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105"
          >
            Export PDF 📄
          </button>
        </div>
      </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => showDeleteModal && handleDeleteItem(showDeleteModal)}
        title="Delete Activity"
        message="Are you sure you want to remove this activity from your itinerary?"
      />
    </>
  );
};