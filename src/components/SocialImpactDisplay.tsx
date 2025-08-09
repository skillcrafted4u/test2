import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { Heart, Users, TreePine, Sparkles } from 'lucide-react';

interface SocialImpactDisplayProps {
  contributionAmount: number;
  totalImpact?: number;
}

const impactStories = [
  {
    id: 1,
    title: "Clean Water Access",
    description: "Your contribution helps provide clean water to remote communities",
    image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: "💧",
    impact: "12 families"
  },
  {
    id: 2,
    title: "Local Education",
    description: "Supporting schools and educational programs in developing regions",
    image: "https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: "📚",
    impact: "25 students"
  },
  {
    id: 3,
    title: "Environmental Conservation",
    description: "Protecting natural habitats and supporting eco-tourism",
    image: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400",
    icon: "🌱",
    impact: "5 acres protected"
  }
];

export const SocialImpactDisplay: React.FC<SocialImpactDisplayProps> = ({ 
  contributionAmount, 
  totalImpact = 0 
}) => {
  const [currentStory, setCurrentStory] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Rotate through impact stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory(prev => (prev + 1) % impactStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animation for contribution amount
  const contributionAnimation = useSpring({
    number: contributionAmount,
    from: { number: 0 },
    config: { duration: 1000 }
  });

  // Animation for progress bar
  const progressAnimation = useSpring({
    width: Math.min((contributionAmount / 100) * 100, 100),
    from: { width: 0 },
    config: { duration: 1500 }
  });

  const story = impactStories[currentStory];

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-3xl p-6 border border-green-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Social Impact</h3>
            <p className="text-white/70 text-sm">Making a difference together</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-green-400 hover:text-green-300 transition-colors duration-200"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Contribution Amount */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2 mb-2">
          <animated.span className="text-3xl font-bold text-green-400">
            {contributionAnimation.number.to(n => `$${n.toFixed(2)}`)}
          </animated.span>
          <span className="text-white/70 text-sm">contributed from your trip</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
          <animated.div
            style={progressAnimation}
            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
          />
        </div>
        <p className="text-white/60 text-xs">1% of your budget supports local communities</p>
      </div>

      {/* Impact Story */}
      <div className="bg-white/5 rounded-2xl p-4 mb-4">
        <div className="flex items-start space-x-4">
          <img
            src={story.image}
            alt={story.title}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{story.icon}</span>
              <h4 className="text-white font-medium">{story.title}</h4>
            </div>
            <p className="text-white/80 text-sm mb-2">{story.description}</p>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">{story.impact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Impact (Expandable) */}
      {showDetails && (
        <animated.div
          style={useSpring({
            opacity: showDetails ? 1 : 0,
            height: showDetails ? 'auto' : 0,
            from: { opacity: 0, height: 0 }
          })}
          className="space-y-3"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-white font-semibold text-sm">Clean Water</div>
              <div className="text-white/70 text-xs">12 families</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-white font-semibold text-sm">Education</div>
              <div className="text-white/70 text-xs">25 students</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🌱</div>
              <div className="text-white font-semibold text-sm">Conservation</div>
              <div className="text-white/70 text-xs">5 acres</div>
            </div>
          </div>
          
          {totalImpact > 0 && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-3 text-center">
              <p className="text-white/80 text-sm">
                🌍 Total community impact: <span className="font-semibold text-green-400">${totalImpact.toFixed(2)}</span>
              </p>
            </div>
          )}
        </animated.div>
      )}

      {/* Story Indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {impactStories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStory(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStory ? 'bg-green-400 w-6' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SocialImpactDisplay;