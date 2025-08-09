import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Clock, Heart, MessageCircle, Share2, Flag, Award, Verified, Star, ThumbsUp, Filter, Search, Plus, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LazyImage from './LazyImage';

interface TravelStory {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badges: string[];
    isVerified: boolean;
    isLocalExpert: boolean;
  };
  trip: {
    destination: string;
    dates: string;
    mood: string;
  };
  media: {
    photos: Array<{
      url: string;
      caption: string;
      location?: string;
      beforeAfter?: { before: string; after: string };
    }>;
    videos?: Array<{
      url: string;
      thumbnail: string;
      duration: number;
    }>;
  };
  template: 'unexpected-discovery' | 'local-gem' | 'travel-fail' | 'cultural-exchange' | 'solo-adventure';
  timeline: Array<{
    day: number;
    title: string;
    description: string;
    photos: string[];
    location: string;
  }>;
  reviews: {
    overall: number;
    aspects: {
      authenticity: number;
      helpfulness: number;
      accuracy: number;
    };
    tags: string[];
    count: number;
  };
  engagement: {
    loves: number;
    comments: number;
    shares: number;
    helpfulVotes: number;
  };
  isLoved: boolean;
  createdAt: string;
  featured: boolean;
}

interface StoryReview {
  id: string;
  storyId: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  rating: {
    overall: number;
    authenticity: number;
    helpfulness: number;
    accuracy: number;
  };
  content: string;
  photos: string[];
  tags: string[];
  helpfulVotes: number;
  isHelpful: boolean;
  createdAt: string;
}

const TravelStories: React.FC = () => {
  const [stories, setStories] = useState<TravelStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<TravelStory | null>(null);
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'featured' | 'recent' | 'trending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  
  const { user } = useAuth();
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  // Mock data for demonstration
  useEffect(() => {
    const mockStories: TravelStory[] = [
      {
        id: 'story-1',
        title: 'The Hidden Ramen Shop That Changed My Tokyo Trip',
        content: 'I was wandering through Shibuya at 2 AM, jet-lagged and hungry, when I stumbled upon this tiny ramen shop with no English sign. The owner spoke no English, I spoke no Japanese, but somehow we connected through food. This became the highlight of my entire trip...',
        author: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          badges: ['Verified Traveler', 'Story Master'],
          isVerified: true,
          isLocalExpert: false
        },
        trip: {
          destination: 'Tokyo, Japan',
          dates: 'March 2024',
          mood: 'spontaneous'
        },
        media: {
          photos: [
            {
              url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
              caption: 'The tiny ramen shop that stole my heart',
              location: 'Shibuya, Tokyo'
            },
            {
              url: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=400',
              caption: 'Best ramen of my life',
              location: 'Shibuya, Tokyo'
            }
          ],
          videos: [
            {
              url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
              thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
              duration: 30
            }
          ]
        },
        template: 'unexpected-discovery',
        timeline: [
          {
            day: 3,
            title: 'Late Night Food Hunt',
            description: 'Wandering Shibuya looking for authentic local food',
            photos: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200'],
            location: 'Shibuya District'
          }
        ],
        reviews: {
          overall: 4.8,
          aspects: {
            authenticity: 5.0,
            helpfulness: 4.7,
            accuracy: 4.6
          },
          tags: ['#authentic', '#hidden-gem', '#local-experience'],
          count: 23
        },
        engagement: {
          loves: 156,
          comments: 34,
          shares: 28,
          helpfulVotes: 89
        },
        isLoved: false,
        createdAt: '2024-03-20',
        featured: true
      },
      {
        id: 'story-2',
        title: 'How I Got Completely Lost in Marrakech (And Loved Every Minute)',
        content: 'GPS doesn\'t work in the medina, my phone died, and I spoke zero Arabic. What started as a disaster became the most magical day of my Morocco trip. Here\'s how getting lost led me to the most incredible experiences...',
        author: {
          id: 'user-2',
          name: 'Ahmed Hassan',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
          badges: ['Local Expert', 'Cultural Guide'],
          isVerified: true,
          isLocalExpert: true
        },
        trip: {
          destination: 'Marrakech, Morocco',
          dates: 'February 2024',
          mood: 'adventure'
        },
        media: {
          photos: [
            {
              url: 'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=400',
              caption: 'Lost in the beautiful chaos of the medina',
              location: 'Marrakech Medina'
            }
          ]
        },
        template: 'travel-fail',
        timeline: [
          {
            day: 2,
            title: 'The Great Getting Lost Adventure',
            description: 'When technology fails, human kindness prevails',
            photos: ['https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=200'],
            location: 'Marrakech Medina'
          }
        ],
        reviews: {
          overall: 4.9,
          aspects: {
            authenticity: 5.0,
            helpfulness: 4.8,
            accuracy: 4.9
          },
          tags: ['#authentic', '#adventure', '#local-wisdom'],
          count: 45
        },
        engagement: {
          loves: 203,
          comments: 67,
          shares: 41,
          helpfulVotes: 134
        },
        isLoved: true,
        createdAt: '2024-02-28',
        featured: true
      }
    ];

    setTimeout(() => {
      setStories(mockStories);
      setLoading(false);
    }, 1000);
  }, []);

  const storyTemplates = [
    {
      id: 'unexpected-discovery',
      title: 'Unexpected Discovery',
      description: 'Share a surprise find that made your trip special',
      icon: '🔍',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'local-gem',
      title: 'Local Gem',
      description: 'Highlight a place only locals know about',
      icon: '💎',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'travel-fail',
      title: 'Travel Fail',
      description: 'Turn a mishap into a learning experience',
      icon: '😅',
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'cultural-exchange',
      title: 'Cultural Exchange',
      description: 'Share a meaningful connection with locals',
      icon: '🤝',
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: 'solo-adventure',
      title: 'Solo Adventure',
      description: 'Inspire other solo travelers with your journey',
      icon: '🎒',
      color: 'from-indigo-400 to-blue-500'
    }
  ];

  const handleLoveStory = (storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { 
            ...story, 
            isLoved: !story.isLoved,
            engagement: { 
              ...story.engagement, 
              loves: story.isLoved ? story.engagement.loves - 1 : story.engagement.loves + 1 
            }
          }
        : story
    ));
  };

  const handleVideoPlay = (videoId: string) => {
    // Pause all other videos
    Object.keys(videoRefs.current).forEach(id => {
      if (id !== videoId && videoRefs.current[id]) {
        videoRefs.current[id].pause();
      }
    });
    
    setPlayingVideo(playingVideo === videoId ? null : videoId);
    
    if (videoRefs.current[videoId]) {
      if (playingVideo === videoId) {
        videoRefs.current[videoId].pause();
      } else {
        videoRefs.current[videoId].play();
      }
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Verified Traveler': return 'bg-blue-500/20 text-blue-300';
      case 'Local Expert': return 'bg-green-500/20 text-green-300';
      case 'Story Master': return 'bg-purple-500/20 text-purple-300';
      case 'Cultural Guide': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTemplateIcon = (template: string) => {
    const templateData = storyTemplates.find(t => t.id === template);
    return templateData?.icon || '📖';
  };

  const filteredStories = stories.filter(story => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'featured' && story.featured) ||
      (activeFilter === 'recent' && new Date(story.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (activeFilter === 'trending' && story.engagement.loves > 100);
    
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
            📖 Travel Stories
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Real stories from real travelers. Discover authentic experiences, hidden gems, and travel wisdom from our community.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories, destinations..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All Stories' },
                { id: 'featured', label: '⭐ Featured' },
                { id: 'recent', label: '🆕 Recent' },
                { id: 'trending', label: '🔥 Trending' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Share Story Button */}
            {user && (
              <button
                onClick={() => setShowStoryEditor(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Share Your Story</span>
              </button>
            )}
          </div>
        </div>

        {/* Featured Story */}
        {activeFilter === 'all' && stories.find(s => s.featured) && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Story</h2>
            </div>
            
            {(() => {
              const featuredStory = stories.find(s => s.featured)!;
              return (
                <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <LazyImage
                        src={featuredStory.media.photos[0]?.url}
                        alt={featuredStory.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-2xl">{getTemplateIcon(featuredStory.template)}</span>
                        <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3">{featuredStory.title}</h3>
                      <p className="text-white/80 mb-4 line-clamp-3">{featuredStory.content}</p>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={featuredStory.author.avatar}
                          alt={featuredStory.author.name}
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{featuredStory.author.name}</span>
                            {featuredStory.author.isVerified && (
                              <Verified className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="text-white/60 text-sm">{featuredStory.trip.destination}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-white/60 text-sm">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{featuredStory.engagement.loves}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{featuredStory.engagement.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>{featuredStory.reviews.overall}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedStory(featuredStory)}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl transition-all duration-200"
                        >
                          Read Story
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <div
              key={story.id}
              className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
            >
              {/* Story Image/Video */}
              <div className="relative overflow-hidden">
                {story.media.videos && story.media.videos.length > 0 ? (
                  <div className="relative">
                    <video
                      ref={el => { if (el) videoRefs.current[story.id] = el; }}
                      className="w-full h-48 object-cover"
                      poster={story.media.videos[0].thumbnail}
                      muted={videoMuted}
                      loop
                    >
                      <source src={story.media.videos[0].url} type="video/mp4" />
                    </video>
                    
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => handleVideoPlay(story.id)}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-all duration-200"
                      >
                        {playingVideo === story.id ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setVideoMuted(!videoMuted)}
                      className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-all duration-200"
                    >
                      {videoMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                ) : (
                  <LazyImage
                    src={story.media.photos[0]?.url}
                    alt={story.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                
                {/* Story Template Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                    {getTemplateIcon(story.template)} {storyTemplates.find(t => t.id === story.template)?.title}
                  </span>
                </div>

                {/* Love Button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleLoveStory(story.id)}
                    className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                      story.isLoved ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-red-500/80'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${story.isLoved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                  {story.title}
                </h3>
                
                <p className="text-white/80 text-sm mb-4 line-clamp-3">
                  {story.content}
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">{story.author.name}</span>
                      {story.author.isVerified && (
                        <Verified className="w-3 h-3 text-blue-400" />
                      )}
                      {story.author.isLocalExpert && (
                        <Award className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                    <div className="text-white/60 text-xs">{story.trip.destination}</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {story.author.badges.slice(0, 2).map(badge => (
                    <span
                      key={badge}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-white/60 text-sm">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{story.engagement.loves}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{story.reviews.overall}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{story.engagement.helpfulVotes}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedStory(story)}
                    className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-white mb-2">No stories found</h3>
            <p className="text-white/70 mb-6">Be the first to share your travel story!</p>
            {user && (
              <button
                onClick={() => setShowStoryEditor(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Share Your Story
              </button>
            )}
          </div>
        )}

        {/* Story Templates Section */}
        {showStoryEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Share Your Travel Story</h2>
                  <button
                    onClick={() => setShowStoryEditor(false)}
                    className="text-white/60 hover:text-white transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Choose a Story Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {storyTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                          selectedTemplate === template.id
                            ? 'border-white bg-white/20'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center text-2xl mb-4`}>
                          {template.icon}
                        </div>
                        <h4 className="text-white font-semibold text-lg mb-2">{template.title}</h4>
                        <p className="text-white/70 text-sm">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-white font-semibold text-lg mb-4">
                      Ready to share your {storyTemplates.find(t => t.id === selectedTemplate)?.title}?
                    </h4>
                    <p className="text-white/70 mb-6">
                      Your authentic story will inspire other travelers and help build our community of genuine travel experiences.
                    </p>
                    <div className="flex space-x-4">
                      <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200">
                        Start Writing
                      </button>
                      <button
                        onClick={() => setSelectedTemplate('')}
                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200"
                      >
                        Choose Different Template
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelStories;