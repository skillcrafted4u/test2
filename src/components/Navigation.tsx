import React from 'react';
import { ArrowLeft, Share2, Download, User, LogOut, Compass, BookOpen, Bot } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  currentStep: number;
  onBack: () => void;
  onShare?: () => void;
  onExport?: () => void;
  showShareExport?: boolean;
  onAuthClick?: () => void;
  onExploreClick?: () => void;
  onProfileClick?: () => void;
  onStoriesClick?: () => void;
}

export default function Navigation({ 
  currentStep, 
  onBack, 
  onShare, 
  onExport, 
  showShareExport, 
  onAuthClick,
  onExploreClick,
  onProfileClick,
  onStoriesClick
}: NavigationProps) {
  const steps = ['Welcome', 'Mood', 'Details', 'Planning', 'Itinerary'];
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {currentStep > 0 && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="text-white font-bold text-xl hover:text-yellow-300 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Wanderlust</span>
            </button>
          </div>

          {/* Center Section - Progress Steps */}
          <div className="hidden lg:flex items-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-white/20 text-white shadow-lg scale-105'
                    : index < currentStep
                    ? 'bg-white/10 text-white/80'
                    : 'text-white/40'
                }`}
              >
                {index < currentStep && <span className="mr-2">✓</span>}
                {step}
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            
            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={onExploreClick}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-all duration-200 px-3 py-2 rounded-full hover:bg-white/10"
              >
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </button>
              <button
                onClick={onStoriesClick}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-all duration-200 px-3 py-2 rounded-full hover:bg-white/10"
              >
                <BookOpen className="w-4 h-4" />
                <span>Stories</span>
              </button>
            </div>

            {/* Share/Export Actions */}
            {showShareExport && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onShare}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={onExport}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            )}

            {/* User Authentication */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onProfileClick}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm">{user.email?.split('@')[0]}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}