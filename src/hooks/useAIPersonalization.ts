import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { aiPersonalizationService } from '../services/aiPersonalizationService'

interface PersonalizationData {
  userProfile: any
  recommendations: any[]
  insights: any
  budgetAllocation: any
  packingList: any
}

export function useAIPersonalization() {
  const [data, setData] = useState<PersonalizationData>({
    userProfile: null,
    recommendations: [],
    insights: null,
    budgetAllocation: null,
    packingList: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()

  // Load user profile and initial data
  const loadPersonalizationData = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const [profile, insights] = await Promise.all([
        aiPersonalizationService.buildUserProfile(user.id),
        aiPersonalizationService.generatePredictiveInsights(user.id)
      ])
      
      setData(prev => ({
        ...prev,
        userProfile: profile,
        insights
      }))
    } catch (err) {
      setError('Failed to load personalization data')
      console.error('Personalization error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Generate personalized recommendations
  const generateRecommendations = useCallback(async (tripDetails: any) => {
    if (!user) return []
    
    setLoading(true)
    setError(null)
    
    try {
      const context = {
        currentSeason: getCurrentSeason(),
        weatherConditions: null,
        localEvents: [],
        priceAlerts: [],
        userMood: tripDetails?.selectedMood?.id || 'adventure'
      }

      const recommendations = await aiPersonalizationService.generatePersonalizedRecommendations(
        user.id,
        tripDetails,
        context
      )
      
      setData(prev => ({ ...prev, recommendations }))
      return recommendations
    } catch (err) {
      setError('Failed to generate recommendations')
      console.error('Recommendation error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  // Generate smart budget allocation
  const generateBudgetAllocation = useCallback(async (totalBudget: number, tripDetails: any) => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const allocation = await aiPersonalizationService.generateSmartBudgetAllocation(
        user.id,
        totalBudget,
        tripDetails
      )
      
      setData(prev => ({ ...prev, budgetAllocation: allocation }))
      return allocation
    } catch (err) {
      setError('Failed to generate budget allocation')
      console.error('Budget allocation error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Generate personalized packing list
  const generatePackingList = useCallback(async (tripDetails: any, weatherData: any) => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const packingList = await aiPersonalizationService.generatePersonalizedPackingList(
        user.id,
        tripDetails,
        weatherData
      )
      
      setData(prev => ({ ...prev, packingList }))
      return packingList
    } catch (err) {
      setError('Failed to generate packing list')
      console.error('Packing list error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Chat with AI buddy
  const chatWithAI = useCallback(async (message: string, context?: any) => {
    if (!user) return "Please sign in to chat with your AI travel buddy!"
    
    try {
      const response = await aiPersonalizationService.chatWithAI(user.id, message, context)
      return response
    } catch (err) {
      console.error('AI chat error:', err)
      return "I'm having trouble understanding. Could you try rephrasing that?"
    }
  }, [user])

  // Update AI personality
  const updateAIPersonality = useCallback(async (personality: 'adventurous' | 'careful' | 'spontaneous' | 'balanced') => {
    if (!user || !data.userProfile) return
    
    const updatedProfile = {
      ...data.userProfile,
      aiPersonality: personality
    }
    
    setData(prev => ({ ...prev, userProfile: updatedProfile }))
  }, [user, data.userProfile])

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadPersonalizationData()
    } else {
      setData({
        userProfile: null,
        recommendations: [],
        insights: null,
        budgetAllocation: null,
        packingList: null
      })
    }
  }, [user, loadPersonalizationData])

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  return {
    ...data,
    loading,
    error,
    loadPersonalizationData,
    generateRecommendations,
    generateBudgetAllocation,
    generatePackingList,
    chatWithAI,
    updateAIPersonality,
    isPersonalized: !!user && !!data.userProfile
  }
}

export default useAIPersonalization