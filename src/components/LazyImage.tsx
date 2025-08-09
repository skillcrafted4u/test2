import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIHVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const currentImgRef = imgRef.current;
    
    if (currentImgRef) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      observerRef.current.observe(currentImgRef);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Animation for image fade-in
  const imageAnimation = useSpring({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'scale(1)' : 'scale(1.05)',
    config: { tension: 300, friction: 30 }
  });

  const placeholderAnimation = useSpring({
    opacity: isLoaded ? 0 : 1,
    config: { tension: 300, friction: 30 }
  });

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <animated.img
        style={placeholderAnimation}
        src={placeholder}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-sm"
        aria-hidden="true"
      />

      {/* Main Image */}
      <animated.img
        ref={imgRef}
        style={imageAnimation}
        src={isInView ? (hasError ? fallback : src) : placeholder}
        alt={alt}
        className="relative w-full h-full object-cover"
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />

      {/* Loading indicator */}
      {!isLoaded && isInView && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;