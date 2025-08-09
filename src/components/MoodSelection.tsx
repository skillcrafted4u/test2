import React, { useState } from 'react';
import { Mood } from '../types';
import { moods } from '../data/moods';
import { ChevronRight } from 'lucide-react';

interface MoodSelectionProps {
  onMoodSelect: (mood: Mood) => void;
}

export default function MoodSelection({ onMoodSelect }: MoodSelectionProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  const handleMoodClick = (mood: Mood) => {
    setSelectedMood(mood);
    setTimeout(() => onMoodSelect(mood), 300);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            What's Your Travel Mood?
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Choose the vibe that speaks to your wandering soul, and we'll craft the perfect adventure tailored just for you
          </p>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {moods.map((mood) => (
            <div
              key={mood.id}
              onClick={() => handleMoodClick(mood)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedMood?.id === mood.id ? 'scale-105 ring-4 ring-white/50' : ''
              }`}
            >
              <div className={`bg-gradient-to-br ${mood.gradient} p-8 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20 hover:shadow-3xl transition-all duration-300`}>
                {/* Mood Emoji */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {mood.emoji}
                </div>
                
                {/* Mood Name */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {mood.name}
                </h3>
                
                {/* Mood Description */}
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {mood.description}
                </p>

                {/* Selection indicator */}
                {hoveredMood === mood.id && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-300">
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                )}
                
                {/* Sparkle animation for selected */}
                {selectedMood?.id === mood.id && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-4 w-1 h-1 bg-white rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Encouraging text */}
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          ✨ Each mood unlocks a completely different adventure experience
        </p>
      </div>
    </div>
  );
}