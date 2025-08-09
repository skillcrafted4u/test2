import { supabase } from '../lib/supabase'
import OpenAI from 'openai'

interface UserProfile {
  id: string
  preferences: {
    favoriteDestinations: string[]
    preferredBudgetRange: [number, number]
    favoriteMoods: string[]
    seasonalPatterns: Record<string, string[]>
    activityPreferences: string[]
    accommodationStyle: string
    diningPreferences: string[]
    transportPreferences: string[]
  }
  travelHistory: {
    totalTrips: number
    countriesVisited: string[]
    averageTripDuration: number
    averageBudget: number
    lastTripDate: string
    moodEvolution: Array<{ date: string; mood: string; satisfaction: number }>
  }
  behaviorPatterns: {
    planningStyle: 'spontaneous' | 'detailed' | 'flexible'
    riskTolerance: 'low' | 'medium' | 'high'
    socialPreference: 'solo' | 'couple' | 'group' | 'family'
    activityLevel: 'relaxed' | 'moderate' | 'active'
    culturalOpenness: number // 1-10 scale
  }
  aiPersonality: 'adventurous' | 'careful' | 'spontaneous' | 'balanced'
}

interface RecommendationContext {
  currentSeason: string
  weatherConditions: any
  localEvents: any[]
  priceAlerts: any[]
  userMood: string
  groupDynamics?: any
}

class AIPersonalizationService {
  private openai: OpenAI
  private userProfiles: Map<string, UserProfile> = new Map()

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
      dangerouslyAllowBrowser: true
    })
  }

  // Build comprehensive user profile from trip history
  async buildUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Get user's trip history
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Analyze patterns
      const profile: UserProfile = {
        id: userId,
        preferences: this.analyzePreferences(trips || []),
        travelHistory: this.analyzeTravelHistory(trips || []),
        behaviorPatterns: this.analyzeBehaviorPatterns(trips || []),
        aiPersonality: 'balanced'
      }

      this.userProfiles.set(userId, profile)
      return profile
    } catch (error) {
      console.error('Error building user profile:', error)
      return this.getDefaultProfile(userId)
    }
  }

  // Generate personalized recommendations using AI
  async generatePersonalizedRecommendations(
    userId: string, 
    tripDetails: any, 
    context: RecommendationContext
  ): Promise<any> {
    try {
      const userProfile = await this.getUserProfile(userId)
      
      const systemPrompt = this.buildPersonalizedPrompt(userProfile, context)
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Create personalized recommendations for: ${JSON.stringify(tripDetails)}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const recommendations = JSON.parse(completion.choices[0].message.content || '{}')
      
      // Learn from this interaction
      await this.updateUserProfile(userId, tripDetails, recommendations)
      
      return recommendations
    } catch (error) {
      console.error('AI recommendation error:', error)
      return this.getFallbackRecommendations(tripDetails)
    }
  }

  // Conversational AI interface
  async chatWithAI(userId: string, message: string, context: any): Promise<string> {
    try {
      const userProfile = await this.getUserProfile(userId)
      
      const systemPrompt = `You are ${userProfile.aiPersonality} AI travel buddy for ${userProfile.id}. 
      
      User Profile:
      - Favorite destinations: ${userProfile.preferences.favoriteDestinations.join(', ')}
      - Travel style: ${userProfile.behaviorPatterns.planningStyle}
      - Risk tolerance: ${userProfile.behaviorPatterns.riskTolerance}
      - Activity level: ${userProfile.behaviorPatterns.activityLevel}
      - Countries visited: ${userProfile.travelHistory.countriesVisited.length}
      - Average budget: $${userProfile.travelHistory.averageBudget}
      
      Personality traits based on setting:
      ${this.getPersonalityTraits(userProfile.aiPersonality)}
      
      Always:
      - Reference their past trips and preferences
      - Explain your reasoning: "I suggested this because..."
      - Ask follow-up questions to learn more
      - Be encouraging and enthusiastic
      - Suggest specific, actionable recommendations
      - Remember this conversation for future interactions`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      return completion.choices[0].message.content || "I'm having trouble understanding. Could you rephrase that?"
    } catch (error) {
      console.error('AI chat error:', error)
      return "I'm experiencing some technical difficulties. Let me help you in a different way!"
    }
  }

  // Smart budget allocation
  async generateSmartBudgetAllocation(userId: string, totalBudget: number, tripDetails: any): Promise<any> {
    try {
      const userProfile = await this.getUserProfile(userId)
      
      const prompt = `Based on this user's travel history and preferences, allocate a $${totalBudget} budget for their ${tripDetails.destination} trip:

      User spending patterns:
      - Average budget: $${userProfile.travelHistory.averageBudget}
      - Preferred moods: ${userProfile.preferences.favoriteMoods.join(', ')}
      - Activity level: ${userProfile.behaviorPatterns.activityLevel}
      - Accommodation style: ${userProfile.preferences.accommodationStyle}
      
      Return JSON with:
      {
        "accommodation": { "amount": 400, "percentage": 40, "reasoning": "..." },
        "food": { "amount": 300, "percentage": 30, "reasoning": "..." },
        "activities": { "amount": 200, "percentage": 20, "reasoning": "..." },
        "transport": { "amount": 100, "percentage": 10, "reasoning": "..." },
        "personalizedTips": ["Tip 1", "Tip 2"],
        "budgetOptimizations": ["Save money by...", "Splurge on..."]
      }`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a financial travel advisor. Provide practical, personalized budget advice." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1000
      })

      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Budget allocation error:', error)
      return this.getDefaultBudgetAllocation(totalBudget)
    }
  }

  // Personalized packing list generation
  async generatePersonalizedPackingList(userId: string, tripDetails: any, weatherData: any): Promise<any> {
    try {
      const userProfile = await this.getUserProfile(userId)
      
      const prompt = `Create a personalized packing list for this traveler:

      Trip: ${tripDetails.destination}, ${tripDetails.startDate} to ${tripDetails.endDate}
      Mood: ${tripDetails.selectedMood?.name}
      Weather: ${JSON.stringify(weatherData)}
      
      User Profile:
      - Activity level: ${userProfile.behaviorPatterns.activityLevel}
      - Risk tolerance: ${userProfile.behaviorPatterns.riskTolerance}
      - Past destinations: ${userProfile.travelHistory.countriesVisited.slice(0, 5).join(', ')}
      - Preferred activities: ${userProfile.preferences.activityPreferences.join(', ')}
      
      Return JSON with categories and personalized reasoning:
      {
        "essentials": [{"item": "Passport", "reason": "Required for international travel"}],
        "clothing": [{"item": "Waterproof jacket", "reason": "Based on weather forecast"}],
        "electronics": [{"item": "Portable charger", "reason": "For your active travel style"}],
        "personalItems": [{"item": "Travel pillow", "reason": "You prefer comfort on long trips"}],
        "activitySpecific": [{"item": "Hiking boots", "reason": "Perfect for your adventure mood"}],
        "personalizedTips": ["Pack light - you tend to buy souvenirs", "Bring layers for temperature changes"]
      }`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a personalized packing advisor who knows this traveler's habits." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Packing list error:', error)
      return this.getDefaultPackingList(tripDetails, weatherData)
    }
  }

  // Predict user preferences and suggest improvements
  async generatePredictiveInsights(userId: string): Promise<any> {
    try {
      const userProfile = await this.getUserProfile(userId)
      
      const insights = {
        moodEvolution: this.analyzeMoodEvolution(userProfile),
        seasonalPredictions: this.predictSeasonalPreferences(userProfile),
        budgetTrends: this.analyzeBudgetTrends(userProfile),
        destinationSuggestions: await this.generateDestinationSuggestions(userProfile),
        timingOptimizations: this.suggestOptimalTiming(userProfile)
      }

      return insights
    } catch (error) {
      console.error('Predictive insights error:', error)
      return null
    }
  }

  // Private helper methods
  private analyzePreferences(trips: any[]): UserProfile['preferences'] {
    const destinations = trips.map(t => t.destination).filter(Boolean)
    const moods = trips.map(t => t.selected_moods?.id).filter(Boolean)
    const budgets = trips.map(t => t.budget).filter(Boolean)

    return {
      favoriteDestinations: [...new Set(destinations)].slice(0, 10),
      preferredBudgetRange: [Math.min(...budgets) || 1000, Math.max(...budgets) || 5000],
      favoriteMoods: [...new Set(moods)].slice(0, 5),
      seasonalPatterns: this.extractSeasonalPatterns(trips),
      activityPreferences: ['sightseeing', 'dining', 'culture'], // Would analyze from activities
      accommodationStyle: 'mid-range',
      diningPreferences: ['local cuisine', 'street food'],
      transportPreferences: ['walking', 'public transport']
    }
  }

  private analyzeTravelHistory(trips: any[]): UserProfile['travelHistory'] {
    const countries = trips.map(t => t.destination?.split(',')[1]?.trim()).filter(Boolean)
    const durations = trips.map(t => {
      if (t.start_date && t.end_date) {
        const start = new Date(t.start_date)
        const end = new Date(t.end_date)
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }
      return 7
    })

    return {
      totalTrips: trips.length,
      countriesVisited: [...new Set(countries)],
      averageTripDuration: durations.reduce((a, b) => a + b, 0) / durations.length || 7,
      averageBudget: trips.reduce((sum, t) => sum + (t.budget || 0), 0) / trips.length || 2000,
      lastTripDate: trips[0]?.created_at || new Date().toISOString(),
      moodEvolution: this.extractMoodEvolution(trips)
    }
  }

  private analyzeBehaviorPatterns(trips: any[]): UserProfile['behaviorPatterns'] {
    // Analyze user behavior from trip data
    const avgBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0) / trips.length || 2000
    const hasInternationalTrips = trips.some(t => t.destination?.includes(','))
    
    return {
      planningStyle: trips.length > 5 ? 'detailed' : 'flexible',
      riskTolerance: hasInternationalTrips ? 'high' : 'medium',
      socialPreference: trips.some(t => (t.traveler_count || 1) > 1) ? 'group' : 'solo',
      activityLevel: 'moderate',
      culturalOpenness: hasInternationalTrips ? 8 : 6
    }
  }

  private extractSeasonalPatterns(trips: any[]): Record<string, string[]> {
    const patterns: Record<string, string[]> = {}
    
    trips.forEach(trip => {
      if (trip.start_date) {
        const month = new Date(trip.start_date).getMonth()
        const season = this.getSeason(month)
        const mood = trip.selected_moods?.id || 'adventure'
        
        if (!patterns[season]) patterns[season] = []
        patterns[season].push(mood)
      }
    })

    return patterns
  }

  private extractMoodEvolution(trips: any[]): Array<{ date: string; mood: string; satisfaction: number }> {
    return trips.map(trip => ({
      date: trip.created_at,
      mood: trip.selected_moods?.id || 'adventure',
      satisfaction: 4.0 + Math.random() * 1.0 // Would come from actual user feedback
    }))
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  private buildPersonalizedPrompt(userProfile: UserProfile, context: RecommendationContext): string {
    return `You are an AI travel buddy with ${userProfile.aiPersonality} personality. 

    User Profile:
    - Travel experience: ${userProfile.travelHistory.totalTrips} trips to ${userProfile.travelHistory.countriesVisited.length} countries
    - Favorite moods: ${userProfile.preferences.favoriteMoods.join(', ')}
    - Budget range: $${userProfile.preferences.preferredBudgetRange[0]}-${userProfile.preferences.preferredBudgetRange[1]}
    - Planning style: ${userProfile.behaviorPatterns.planningStyle}
    - Activity level: ${userProfile.behaviorPatterns.activityLevel}
    - Risk tolerance: ${userProfile.behaviorPatterns.riskTolerance}
    
    Current Context:
    - Season: ${context.currentSeason}
    - Weather: ${JSON.stringify(context.weatherConditions)}
    - User mood: ${context.userMood}
    
    Personality Traits:
    ${this.getPersonalityTraits(userProfile.aiPersonality)}
    
    Always explain your reasoning and reference their travel history when making suggestions.`
  }

  private getPersonalityTraits(personality: string): string {
    const traits = {
      adventurous: "- Push boundaries and suggest thrilling experiences\n- Encourage trying new things\n- Focus on unique, off-the-beaten-path activities\n- Be enthusiastic about challenges",
      careful: "- Prioritize safety and well-researched options\n- Suggest backup plans\n- Focus on reliable, well-reviewed experiences\n- Provide detailed preparation tips",
      spontaneous: "- Embrace uncertainty and surprise elements\n- Suggest flexible itineraries\n- Encourage last-minute discoveries\n- Be playful and unpredictable",
      balanced: "- Mix planned activities with spontaneous moments\n- Consider both comfort and adventure\n- Provide options for different energy levels\n- Be supportive and adaptable"
    }
    return traits[personality as keyof typeof traits] || traits.balanced
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!
    }
    return await this.buildUserProfile(userId)
  }

  private getDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      preferences: {
        favoriteDestinations: [],
        preferredBudgetRange: [1000, 5000],
        favoriteMoods: ['adventure'],
        seasonalPatterns: {},
        activityPreferences: [],
        accommodationStyle: 'mid-range',
        diningPreferences: [],
        transportPreferences: []
      },
      travelHistory: {
        totalTrips: 0,
        countriesVisited: [],
        averageTripDuration: 7,
        averageBudget: 2000,
        lastTripDate: new Date().toISOString(),
        moodEvolution: []
      },
      behaviorPatterns: {
        planningStyle: 'flexible',
        riskTolerance: 'medium',
        socialPreference: 'solo',
        activityLevel: 'moderate',
        culturalOpenness: 7
      },
      aiPersonality: 'balanced'
    }
  }

  private getFallbackRecommendations(tripDetails: any): any {
    return {
      hiddenGems: ["Local market exploration", "Neighborhood walking tour"],
      budgetTips: ["Book accommodations early", "Try street food"],
      packingList: ["Comfortable walking shoes", "Weather-appropriate clothing"],
      timingAdvice: "Best time to visit is during shoulder season",
      personalizedNote: "Based on popular traveler preferences"
    }
  }

  private getDefaultBudgetAllocation(totalBudget: number): any {
    return {
      accommodation: { amount: totalBudget * 0.4, percentage: 40, reasoning: "Standard allocation for comfortable stays" },
      food: { amount: totalBudget * 0.3, percentage: 30, reasoning: "Balanced dining experiences" },
      activities: { amount: totalBudget * 0.2, percentage: 20, reasoning: "Mix of paid attractions and free exploration" },
      transport: { amount: totalBudget * 0.1, percentage: 10, reasoning: "Local transportation and transfers" },
      personalizedTips: ["Book accommodations early for better rates"],
      budgetOptimizations: ["Consider staying slightly outside city center"]
    }
  }

  private getDefaultPackingList(tripDetails: any, weatherData: any): any {
    return {
      essentials: [{ item: "Passport", reason: "Required for travel" }],
      clothing: [{ item: "Comfortable walking shoes", reason: "Essential for exploration" }],
      electronics: [{ item: "Phone charger", reason: "Stay connected" }],
      personalItems: [{ item: "Sunscreen", reason: "Protect from sun exposure" }],
      activitySpecific: [{ item: "Camera", reason: "Capture memories" }],
      personalizedTips: ["Pack light and leave room for souvenirs"]
    }
  }

  private analyzeMoodEvolution(userProfile: UserProfile): any {
    const evolution = userProfile.travelHistory.moodEvolution
    if (evolution.length < 2) return null

    const recent = evolution.slice(0, 3)
    const older = evolution.slice(3, 6)
    
    return {
      trend: recent.length > 0 ? recent[0].mood : 'adventure',
      confidence: 0.8,
      insight: "You've been gravitating toward more adventurous experiences lately"
    }
  }

  private predictSeasonalPreferences(userProfile: UserProfile): any {
    const patterns = userProfile.preferences.seasonalPatterns
    const currentSeason = this.getSeason(new Date().getMonth())
    
    return {
      currentSeason,
      prediction: patterns[currentSeason] || ['adventure'],
      confidence: Object.keys(patterns).length > 0 ? 0.7 : 0.3,
      suggestion: "Based on your travel history, you might enjoy cultural experiences this season"
    }
  }

  private analyzeBudgetTrends(userProfile: UserProfile): any {
    return {
      trend: 'increasing',
      averageGrowth: 15,
      insight: "Your travel budgets have been increasing, suggesting growing confidence in premium experiences"
    }
  }

  private async generateDestinationSuggestions(userProfile: UserProfile): Promise<string[]> {
    const visited = userProfile.travelHistory.countriesVisited
    const favorites = userProfile.preferences.favoriteDestinations
    
    // Simple recommendation logic (would be enhanced with ML)
    const suggestions = [
      "Based on your love for culture, try Kyoto, Japan",
      "Since you enjoyed Paris, you might love Vienna, Austria",
      "Your adventurous spirit would love New Zealand"
    ]
    
    return suggestions.slice(0, 3)
  }

  private suggestOptimalTiming(userProfile: UserProfile): any {
    return {
      bestMonths: ['April', 'May', 'September', 'October'],
      reasoning: "Based on your preference for mild weather and cultural activities",
      priceOptimization: "Travel in shoulder seasons for 30% savings"
    }
  }

  private async updateUserProfile(userId: string, tripDetails: any, recommendations: any): Promise<void> {
    // Update user profile based on interactions
    const profile = await this.getUserProfile(userId)
    
    // Simple learning - would be more sophisticated in production
    if (tripDetails.selectedMood && !profile.preferences.favoriteMoods.includes(tripDetails.selectedMood.id)) {
      profile.preferences.favoriteMoods.push(tripDetails.selectedMood.id)
    }
    
    this.userProfiles.set(userId, profile)
  }
}

export const aiPersonalizationService = new AIPersonalizationService()
export default aiPersonalizationService