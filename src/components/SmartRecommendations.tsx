import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, MapPin, Calendar, DollarSign, Users, Sparkles, Clock, Target, Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { aiPersonalizationService } from '../services/aiPersonalizationService'
import { useSpring, animated } from 'react-spring'

interface SmartRecommendationsProps {
  tripDetails?: any
  onRecommendationSelect?: (recommendation: any) => void
}

interface Recommendation {
  id: string
  type: 'destination' | 'activity' | 'timing' | 'budget' | 'hidden-gem'
  title: string
  description: string
  reasoning: string
  confidence: number
  icon: string
  actionable: boolean
  data?: any
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ 
  tripDetails, 
  onRecommendationSelect 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  
  const { user } = useAuth()

  // Load recommendations on mount
  useEffect(() => {
    if (user) {
      loadPersonalizedRecommendations()
      loadUserInsights()
    } else {
      loadGuestRecommendations()
    }
  }, [user, tripDetails])

  const loadPersonalizedRecommendations = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Build user profile
      const profile = await aiPersonalizationService.buildUserProfile(user.id)
      setUserProfile(profile)

      // Generate recommendations
      const context = {
        currentSeason: getCurrentSeason(),
        weatherConditions: null,
        localEvents: [],
        priceAlerts: [],
        userMood: tripDetails?.selectedMood?.id || 'adventure'
      }

      const aiRecommendations = await aiPersonalizationService.generatePersonalizedRecommendations(
        user.id,
        tripDetails,
        context
      )

      // Convert to UI format
      const formattedRecommendations = formatRecommendations(aiRecommendations, profile)
      setRecommendations(formattedRecommendations)
      
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      setRecommendations(getDefaultRecommendations())
    } finally {
      setLoading(false)
    }
  }

  const loadUserInsights = async () => {
    if (!user) return
    
    try {
      const userInsights = await aiPersonalizationService.generatePredictiveInsights(user.id)
      setInsights(userInsights)
    } catch (error) {
      console.error('Failed to load insights:', error)
    }
  }

  const loadGuestRecommendations = () => {
    setRecommendations(getDefaultRecommendations())
  }

  const formatRecommendations = (aiData: any, profile: any): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Hidden gems
    if (aiData.hiddenGems) {
      aiData.hiddenGems.forEach((gem: string, index: number) => {
        recommendations.push({
          id: `gem-${index}`,
          type: 'hidden-gem',
          title: 'Hidden Gem Discovery',
          description: gem,
          reasoning: `Based on your ${profile.behaviorPatterns.activityLevel} activity level and love for authentic experiences`,
          confidence: 0.85,
          icon: '💎',
          actionable: true,
          data: { activity: gem }
        })
      })
    }

    // Budget tips
    if (aiData.budgetTips) {
      aiData.budgetTips.forEach((tip: string, index: number) => {
        recommendations.push({
          id: `budget-${index}`,
          type: 'budget',
          title: 'Smart Budget Tip',
          description: tip,
          reasoning: `Optimized for your $${profile.travelHistory.averageBudget} average budget`,
          confidence: 0.9,
          icon: '💰',
          actionable: true,
          data: { tip }
        })
      })
    }

    // Timing advice
    if (aiData.timingAdvice) {
      recommendations.push({
        id: 'timing-1',
        type: 'timing',
        title: 'Optimal Timing',
        description: aiData.timingAdvice,
        reasoning: 'Based on weather patterns and your seasonal preferences',
        confidence: 0.8,
        icon: '⏰',
        actionable: true,
        data: { timing: aiData.timingAdvice }
      })
    }

    return recommendations
  }

  const getDefaultRecommendations = (): Recommendation[] => {
    return [
      {
        id: 'default-1',
        type: 'destination',
        title: 'Popular Destination',
        description: 'Explore trending destinations that match your selected mood',
        reasoning: 'Based on community favorites and current trends',
        confidence: 0.7,
        icon: '🌟',
        actionable: true
      },
      {
        id: 'default-2',
        type: 'budget',
        title: 'Budget Optimization',
        description: 'Save 20% by traveling during shoulder season',
        reasoning: 'Historical price data shows significant savings',
        confidence: 0.9,
        icon: '💰',
        actionable: true
      },
      {
        id: 'default-3',
        type: 'activity',
        title: 'Local Experience',
        description: 'Try authentic cooking classes with local families',
        reasoning: 'Highly rated by travelers with similar interests',
        confidence: 0.8,
        icon: '🍳',
        actionable: true
      }
    ]
  }

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      destination: <MapPin className="w-5 h-5" />,
      activity: <Zap className="w-5 h-5" />,
      timing: <Clock className="w-5 h-5" />,
      budget: <DollarSign className="w-5 h-5" />,
      'hidden-gem': <Sparkles className="w-5 h-5" />
    }
    return icons[type as keyof typeof icons] || <Target className="w-5 h-5" />
  }

  const getTypeColor = (type: string) => {
    const colors = {
      destination: 'from-blue-400 to-purple-500',
      activity: 'from-green-400 to-teal-500',
      timing: 'from-orange-400 to-red-500',
      budget: 'from-yellow-400 to-orange-500',
      'hidden-gem': 'from-purple-400 to-pink-500'
    }
    return colors[type as keyof typeof colors] || 'from-gray-400 to-gray-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === selectedType)

  const recommendationTypes = [
    { id: 'all', label: 'All', icon: '🎯' },
    { id: 'destination', label: 'Destinations', icon: '🌍' },
    { id: 'activity', label: 'Activities', icon: '⚡' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'timing', label: 'Timing', icon: '⏰' },
    { id: 'hidden-gem', label: 'Hidden Gems', icon: '💎' }
  ]

  // Animation for recommendations
  const containerAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0px)',
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 300, friction: 30 }
  })

  return (
    <animated.div style={containerAnimation} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Smart Recommendations</h2>
            <p className="text-white/70">
              {user ? 'Personalized for your travel style' : 'Popular suggestions for travelers'}
            </p>
          </div>
        </div>
        
        {user && userProfile && (
          <div className="text-right">
            <div className="text-white/70 text-sm">Travel Profile</div>
            <div className="text-white font-medium">
              {userProfile.travelHistory.totalTrips} trips • {userProfile.travelHistory.countriesVisited.length} countries
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {recommendationTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
              selectedType === type.id
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">🧠 Analyzing your travel patterns...</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="group bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
              onClick={() => onRecommendationSelect?.(rec)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(rec.type)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  {getTypeIcon(rec.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{rec.title}</h3>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(rec.confidence)}`}></div>
                      <span className={`text-sm ${getConfidenceColor(rec.confidence)}`}>
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-3 leading-relaxed">{rec.description}</p>
                  
                  <div className="bg-white/5 rounded-xl p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70 text-sm font-medium">AI Reasoning:</span>
                    </div>
                    <p className="text-white/60 text-sm">{rec.reasoning}</p>
                  </div>
                  
                  {rec.actionable && (
                    <button className="w-full bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white py-2 px-4 rounded-xl transition-all duration-200 text-sm font-medium">
                      Apply Recommendation →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Insights Panel */}
      {user && insights && (
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h3 className="text-white font-semibold text-xl">Your Travel Evolution</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Mood Evolution */}
            {insights.moodEvolution && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Mood Trends</h4>
                <p className="text-white/80 text-sm mb-2">{insights.moodEvolution.insight}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-medium">Trending:</span>
                  <span className="text-white capitalize">{insights.moodEvolution.trend}</span>
                </div>
              </div>
            )}

            {/* Budget Evolution */}
            {insights.budgetTrends && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Budget Patterns</h4>
                <p className="text-white/80 text-sm mb-2">{insights.budgetTrends.insight}</p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">+{insights.budgetTrends.averageGrowth}%</span>
                </div>
              </div>
            )}

            {/* Seasonal Preferences */}
            {insights.seasonalPredictions && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Seasonal Insights</h4>
                <p className="text-white/80 text-sm">{insights.seasonalPredictions.suggestion}</p>
                <div className="mt-2 text-blue-400 text-sm">
                  {insights.seasonalPredictions.currentSeason} season
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold text-white mb-2">Learning Your Preferences</h3>
          <p className="text-white/70 mb-6">
            {user 
              ? 'Complete a few trips to unlock personalized AI recommendations!'
              : 'Sign in to get personalized recommendations based on your travel history!'
            }
          </p>
        </div>
      )}
    </animated.div>
  )
}

export default SmartRecommendations