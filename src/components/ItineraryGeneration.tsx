import React, { useState, useEffect } from 'react';
import { TripDetails } from '../types';
import { Plane, MapPin, Clock, Sparkles } from 'lucide-react';

interface ItineraryGenerationProps {
  tripDetails: TripDetails;
  onGenerationComplete: () => void;
}

const loadingMessages = [
  "✈️ Searching for the perfect flights...",
  "🏨 Finding amazing places to stay...", 
  "🍽️ Discovering local culinary gems...",
  "🎯 Matching activities to your vibe...",
  "📍 Mapping the perfect route...",
  "⭐ Adding magical moments...",
  "🎨 Crafting your personalized experience...",
  "✨ Almost ready! Adding final touches...",
  "🌟 Consulting local experts...",
  "🎭 Finding unique cultural experiences...",
  "🏞️ Scouting scenic viewpoints...",
  "🎪 Adding surprise elements..."
];

export default function ItineraryGeneration({ tripDetails, onGenerationComplete }: ItineraryGenerationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Simulate API call with potential failure
    const shouldFail = Math.random() < 0.1; // 10% chance of failure for demo
    
    if (shouldFail && retryCount === 0) {
      setTimeout(() => {
        setHasError(true);
      }, 3000);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    // Message rotation
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1000);

    // Complete animation
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onGenerationComplete, 1000);
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(completeTimer);
    };
  }, [onGenerationComplete, retryCount]);

  const handleRetry = () => {
    setHasError(false);
    setProgress(0);
    setCurrentMessageIndex(0);
    setRetryCount(prev => prev + 1);
  };

  const getDurationInDays = () => {
    const start = new Date(tripDetails.startDate);
    const end = new Date(tripDetails.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Our AI travel assistant is taking a quick coffee break. Let's try again!
          </p>
          <button
            onClick={handleRetry}
            className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white px-12 py-4 rounded-full text-lg font-semibold backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-105"
          >
            Try Again ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="text-7xl animate-bounce">{tripDetails.selectedMood?.emoji}</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Crafting Your Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              {tripDetails.selectedMood?.name}
            </span>{' '}
            Adventure
          </h1>
          <p className="text-xl text-white/80">
            Our AI is working its magic to create an unforgettable {getDurationInDays()}-day journey just for you
          </p>
        </div>

        {/* Trip Summary Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-white/80" />
              <div>
                <div className="text-white/70 text-sm">Destination</div>
                <div className="text-white font-semibold text-lg">{tripDetails.destination}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-white/80" />
              <div>
                <div className="text-white/70 text-sm">Duration</div>
                <div className="text-white font-semibold text-lg">{getDurationInDays()} days</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Plane className="w-6 h-6 text-white/80" />
              <div>
                <div className="text-white/70 text-sm">Travelers</div>
                <div className="text-white font-semibold text-lg">{tripDetails.travelers} {tripDetails.travelers === 1 ? 'person' : 'people'}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-white/80" />
              <div>
                <div className="text-white/70 text-sm">Budget</div>
                <div className="text-white font-semibold text-lg">{tripDetails.currency} {tripDetails.budget.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-8">
          {/* Progress bar */}
          <div className="space-y-4">
            <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm border border-white/20">
              <div 
                className="bg-gradient-to-r from-yellow-300 to-orange-400 h-3 rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-white/80 text-lg font-medium">
              {progress}% complete
            </div>
          </div>

          {/* Loading message */}
          <div className="h-16 flex items-center justify-center">
            <p className={`text-xl sm:text-2xl text-white/90 transition-all duration-500 text-center ${isComplete ? 'scale-110 text-yellow-300' : ''}`}>
              {isComplete ? "🎉 Your perfect trip is ready!" : loadingMessages[currentMessageIndex]}
            </p>
          </div>

          {/* Animated dots */}
          {!isComplete && (
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 bg-white/60 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                ></div>
              ))}
            </div>
          )}

          {/* Sparkle animation */}
          {isComplete && (
            <div className="relative">
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}