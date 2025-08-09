import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Bot, User, ThumbsUp, ThumbsDown, Sparkles, Brain, Lightbulb, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { aiPersonalizationService } from '../services/aiPersonalizationService'
import { useSpring, animated } from 'react-spring'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  feedback?: 'positive' | 'negative'
  suggestions?: string[]
  insights?: any
}

interface AITravelBuddyProps {
  isOpen: boolean
  onClose: () => void
  tripContext?: any
}

const AITravelBuddy: React.FC<AITravelBuddyProps> = ({ isOpen, onClose, tripContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [aiPersonality, setAiPersonality] = useState<'adventurous' | 'careful' | 'spontaneous' | 'balanced'>('balanced')
  const [showInsights, setShowInsights] = useState(false)
  const [userInsights, setUserInsights] = useState<any>(null)
  
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Animation for modal
  const modalAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 300, friction: 30 }
  })

  // Initialize AI buddy with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Hey there! 👋 I'm your AI travel buddy. I've analyzed your travel patterns and I'm here to help make your trips even more amazing! 

What would you like to explore today? I can help with:
• Personalized destination recommendations
• Smart budget planning
• Custom packing lists
• Hidden gem discoveries
• Trip optimization tips

Just ask me anything! 🌟`,
        timestamp: new Date(),
        suggestions: [
          "What destinations match my travel style?",
          "Help me plan a budget for Tokyo",
          "What should I pack for my next trip?",
          "Find me some hidden gems"
        ]
      }
      setMessages([welcomeMessage])
      
      // Load user insights
      if (user) {
        loadUserInsights()
      }
    }
  }, [isOpen, user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const loadUserInsights = async () => {
    if (!user) return
    
    try {
      const insights = await aiPersonalizationService.generatePredictiveInsights(user.id)
      setUserInsights(insights)
    } catch (error) {
      console.error('Failed to load user insights:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await aiPersonalizationService.chatWithAI(
        user?.id || 'guest',
        inputMessage,
        { tripContext, aiPersonality }
      )

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: generateSuggestions(inputMessage)
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having some trouble right now. Let me help you in a different way! What specific aspect of your trip would you like to discuss?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ))
    
    // Send feedback to AI service for learning
    console.log('User feedback:', { messageId, feedback })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const generateSuggestions = (userInput: string): string[] => {
    const suggestions = [
      "Tell me more about that",
      "What are the alternatives?",
      "How much would that cost?",
      "What's the best time to go?",
      "Any safety considerations?"
    ]
    return suggestions.slice(0, 3)
  }

  const getPersonalityIcon = (personality: string) => {
    const icons = {
      adventurous: '🏔️',
      careful: '🛡️',
      spontaneous: '🎲',
      balanced: '⚖️'
    }
    return icons[personality as keyof typeof icons] || '⚖️'
  }

  const getPersonalityColor = (personality: string) => {
    const colors = {
      adventurous: 'from-orange-400 to-red-500',
      careful: 'from-blue-400 to-indigo-500',
      spontaneous: 'from-purple-400 to-pink-500',
      balanced: 'from-green-400 to-teal-500'
    }
    return colors[personality as keyof typeof colors] || 'from-green-400 to-teal-500'
  }

  if (!isOpen) return null

  return (
    <animated.div
      style={modalAnimation}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-4xl w-full h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPersonalityColor(aiPersonality)} flex items-center justify-center text-2xl shadow-lg`}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your AI Travel Buddy</h2>
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">Personality:</span>
                <select
                  value={aiPersonality}
                  onChange={(e) => setAiPersonality(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-lg text-white text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <option value="balanced" className="bg-gray-800">⚖️ Balanced</option>
                  <option value="adventurous" className="bg-gray-800">🏔️ Adventurous</option>
                  <option value="careful" className="bg-gray-800">🛡️ Careful</option>
                  <option value="spontaneous" className="bg-gray-800">🎲 Spontaneous</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200"
              title="View Insights"
            >
              <Brain className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    
                    {/* Message Bubble */}
                    <div className={`p-4 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white ml-auto' 
                        : 'bg-white/10 text-white'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {message.type === 'ai' && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getPersonalityColor(aiPersonality)} flex items-center justify-center flex-shrink-0`}>
                            {getPersonalityIcon(aiPersonality)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          
                          {/* AI Message Suggestions */}
                          {message.type === 'ai' && message.suggestions && (
                            <div className="mt-3 space-y-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block w-full text-left p-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors duration-200"
                                >
                                  💡 {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback Buttons for AI Messages */}
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-2 mt-2 justify-start">
                        <button
                          onClick={() => handleFeedback(message.id, 'positive')}
                          className={`p-1 rounded-full transition-colors duration-200 ${
                            message.feedback === 'positive' 
                              ? 'bg-green-500/30 text-green-400' 
                              : 'bg-white/10 text-white/60 hover:text-green-400'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'negative')}
                          className={`p-1 rounded-full transition-colors duration-200 ${
                            message.feedback === 'negative' 
                              ? 'bg-red-500/30 text-red-400' 
                              : 'bg-white/10 text-white/60 hover:text-red-400'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                        <span className="text-white/50 text-xs">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getPersonalityColor(aiPersonality)} flex items-center justify-center`}>
                        {getPersonalityIcon(aiPersonality)}
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about your travels..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 pr-12"
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-200 ${
                      isListening ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white p-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Voice Input Indicator */}
              {isListening && (
                <div className="mt-3 flex items-center justify-center space-x-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Listening...</span>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-100"></div>
                </div>
              )}
            </div>
          </div>

          {/* Insights Sidebar */}
          {showInsights && userInsights && (
            <div className="w-80 border-l border-white/20 p-6 overflow-y-auto">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Your Travel Insights</h3>
              </div>

              <div className="space-y-4">
                
                {/* Mood Evolution */}
                {userInsights.moodEvolution && (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <h4 className="text-white font-medium">Mood Evolution</h4>
                    </div>
                    <p className="text-white/80 text-sm">{userInsights.moodEvolution.insight}</p>
                    <div className="mt-2 text-green-400 text-sm font-medium">
                      Trending: {userInsights.moodEvolution.trend}
                    </div>
                  </div>
                )}

                {/* Seasonal Predictions */}
                {userInsights.seasonalPredictions && (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <h4 className="text-white font-medium">Seasonal Insights</h4>
                    </div>
                    <p className="text-white/80 text-sm">{userInsights.seasonalPredictions.suggestion}</p>
                  </div>
                )}

                {/* Destination Suggestions */}
                {userInsights.destinationSuggestions && (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-white font-medium">Recommendations</h4>
                    </div>
                    <div className="space-y-2">
                      {userInsights.destinationSuggestions.map((suggestion: string, index: number) => (
                        <p key={index} className="text-white/80 text-sm">• {suggestion}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Trends */}
                {userInsights.budgetTrends && (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <h4 className="text-white font-medium">Budget Trends</h4>
                    </div>
                    <p className="text-white/80 text-sm">{userInsights.budgetTrends.insight}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </animated.div>
  )
}

export default AITravelBuddy