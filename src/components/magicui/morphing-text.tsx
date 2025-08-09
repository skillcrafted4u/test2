import React, { useState, useEffect } from 'react';

interface MorphingTextProps {
  texts: string[];
  className?: string;
  duration?: number;
}

export const MorphingText: React.FC<MorphingTextProps> = ({ 
  texts, 
  className = '',
  duration = 3000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);
    }, duration);
    
    return () => clearInterval(interval);
  }, [texts.length, duration]);

  return (
    <div 
      className={`transition-all duration-500 ease-in-out transform ${
      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
    } ${className}`}
      style={{ fontFamily: 'Fredoka One, cursive' }}
    >
      {texts[currentIndex]}
    </div>
  );
};