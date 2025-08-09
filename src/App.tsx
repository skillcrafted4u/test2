import React, { useState } from 'react';
import { Suspense, lazy } from 'react';
import { TripDetails, Mood } from './types';
import { useAuth } from './hooks/useAuth';
import { useTrips } from './hooks/useTrips';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import OfflineIndicator from './components/OfflineIndicator';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import FeatureShowcase from './components/FeatureShowcase';
import CommunitySection from './components/CommunitySection';

// Lazy load components for better performance
const Landing = lazy(() => import('./components/Landing'));
const MoodSelection = lazy(() => import('./components/MoodSelection'));
const TripSetup = lazy(() => import('./components/TripSetup'));
const ItineraryGeneration = lazy(() => import('./components/ItineraryGeneration'));
const ItineraryDisplay = lazy(() => import('./components/ItineraryDisplay').then(module => ({ default: module.ItineraryDisplay })));
const ShareExport = lazy(() => import('./components/ShareExport'));
const TripGallery = lazy(() => import('./components/TripGallery'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const TravelStories = lazy(() => import('./components/TravelStories'));
const AITravelBuddy = lazy(() => import('./components/AITravelBuddy'));
const SmartRecommendations = lazy(() => import('./components/SmartRecommendations'));
const PersonalizedPackingList = lazy(() => import('./components/PersonalizedPackingList'));
const SmartBudgetPlanner = lazy(() => import('./components/SmartBudgetPlanner'));

type AppStep = 'landing' | 'mood' | 'setup' | 'generating' | 'itinerary' | 'share' | 'explore' | 'profile' | 'stories';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [showAIBuddy, setShowAIBuddy] = useState(false);
  const [showPackingList, setShowPackingList] = useState(false);
  const [showBudgetPlanner, setShowBudgetPlanner] = useState(false);
  
  const { user } = useAuth();
  const { saveTrip } = useTrips();

  const handleGetStarted = () => {
    setCurrentStep('mood');
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setCurrentStep('setup');
  };

  const handleTripSubmit = (details: TripDetails) => {
    setTripDetails(details);
    setCurrentStep('generating');
  };

  const handleGenerationComplete = async () => {
    // Save trip to database if user is authenticated or as guest
    if (tripDetails) {
      try {
        const tripId = await saveTrip(tripDetails);
        if (tripId) {
          setCurrentTripId(tripId);
        }
      } catch (error) {
        console.error('Failed to save trip:', error);
      }
    }
    setCurrentStep('itinerary');
  };

  const handleShare = () => {
    setCurrentStep('share');
  };

  const handleExport = () => {
    if (!tripDetails) return;
    // Mock export functionality
    const filename = `${tripDetails.destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.pdf`;
    alert(`Exporting your trip as ${filename}...`);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'mood':
        setCurrentStep('landing');
        break;
      case 'setup':
        setCurrentStep('mood');
        break;
      case 'generating':
        setCurrentStep('setup');
        break;
      case 'itinerary':
        setCurrentStep('generating');
        break;
      case 'share':
        setCurrentStep('itinerary');
        break;
      case 'explore':
      case 'profile':
      case 'stories':
        setCurrentStep('landing');
        break;
      default:
        setCurrentStep('landing');
    }
  };

  const getStepIndex = () => {
    const stepMap: Record<AppStep, number> = {
      landing: 0,
      mood: 1,
      setup: 2,
      generating: 3,
      itinerary: 4,
      share: 4,
      explore: 0,
      profile: 0,
      stories: 0
    };
    return stepMap[currentStep];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-400/20 via-pink-500/20 to-blue-600/20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      {currentStep !== 'landing' && (
        <Navigation
          currentStep={getStepIndex()}
          onBack={handleBack}
          onShare={currentStep === 'itinerary' ? handleShare : undefined}
          onExport={currentStep === 'itinerary' ? handleExport : undefined}
          showShareExport={currentStep === 'itinerary'}
          onAuthClick={() => setShowAuthModal(true)}
          onExploreClick={() => setCurrentStep('explore')}
          onProfileClick={() => setCurrentStep('profile')}
          onStoriesClick={() => setCurrentStep('stories')}
        />
      )}

      {/* Main Content */}
      <ErrorBoundary>
        <div className="relative z-10">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSkeleton type="card" count={3} className="max-w-md w-full" />
            </div>
          }>
            {currentStep === 'landing' && (
              <Landing 
                onGetStarted={handleGetStarted} 
                onExplore={() => setCurrentStep('explore')}
                onStories={() => setCurrentStep('stories')}
              />
            )}
            
            {currentStep === 'landing' && (
              <>
                <FeatureShowcase />
                <CommunitySection />
              </>
            )}
            
            {currentStep === 'explore' && (
              <TripGallery />
            )}
            
            {currentStep === 'profile' && user && (
              <UserProfile />
            )}
            
            {currentStep === 'stories' && (
              <TravelStories />
            )}
            
            {currentStep === 'mood' && (
              <MoodSelection onMoodSelect={handleMoodSelect} />
            )}
            
            {currentStep === 'setup' && selectedMood && (
              <TripSetup 
                selectedMood={selectedMood} 
                onTripSubmit={handleTripSubmit} 
              />
            )}
            
            {currentStep === 'generating' && tripDetails && (
              <ItineraryGeneration 
                tripDetails={tripDetails}
                onGenerationComplete={handleGenerationComplete}
              />
            )}
            
            {currentStep === 'itinerary' && tripDetails && (
              <ItineraryDisplay 
                tripDetails={tripDetails}
                onShare={handleShare}
                onExport={handleExport}
                onShowAIBuddy={() => setShowAIBuddy(true)}
                onShowPackingList={() => setShowPackingList(true)}
                onShowBudgetPlanner={() => setShowBudgetPlanner(true)}
              />
            )}
            
            {currentStep === 'share' && tripDetails && (
              <ShareExport 
                tripDetails={tripDetails}
                onBack={() => setCurrentStep('itinerary')}
              />
            )}
          </Suspense>
        </div>
      </ErrorBoundary>

      {/* Modals and Overlays */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
      
      <OfflineIndicator />
      
      <AITravelBuddy
        isOpen={showAIBuddy}
        onClose={() => setShowAIBuddy(false)}
        tripContext={tripDetails}
      />
      
      <PersonalizedPackingList
        tripDetails={tripDetails}
        weatherData={null}
        isOpen={showPackingList}
        onClose={() => setShowPackingList(false)}
      />
      
      <SmartBudgetPlanner
        tripDetails={tripDetails}
        isOpen={showBudgetPlanner}
        onClose={() => setShowBudgetPlanner(false)}
        onBudgetUpdate={(newBudget) => {
          if (tripDetails) {
            setTripDetails({ ...tripDetails, budget: newBudget.totalBudget })
          }
        }}
      />
      
      {/* Smart Recommendations for authenticated users */}
      {user && currentStep === 'setup' && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm">
          <SmartRecommendations
            tripDetails={tripDetails}
            onRecommendationSelect={(rec) => {
              console.log('Recommendation selected:', rec)
              // Could auto-apply recommendations to trip setup
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;