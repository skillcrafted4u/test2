import React, { useState, useEffect } from 'react'
import { DollarSign, PieChart, TrendingUp, Brain, Lightbulb, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { useAIPersonalization } from '../hooks/useAIPersonalization'
import { useSpring, animated } from 'react-spring'

interface SmartBudgetPlannerProps {
  tripDetails: any
  isOpen: boolean
  onClose: () => void
  onBudgetUpdate: (newBudget: any) => void
}

interface BudgetCategory {
  name: string
  amount: number
  percentage: number
  reasoning: string
  icon: string
  color: string
  suggestions: string[]
}

const SmartBudgetPlanner: React.FC<SmartBudgetPlannerProps> = ({
  tripDetails,
  isOpen,
  onClose,
  onBudgetUpdate
}) => {
  const [budgetAllocation, setBudgetAllocation] = useState<Record<string, BudgetCategory>>({})
  const [totalBudget, setTotalBudget] = useState(tripDetails?.budget || 2000)
  const [optimizations, setOptimizations] = useState<string[]>([])
  const [personalizedTips, setPersonalizedTips] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showOptimizations, setShowOptimizations] = useState(false)
  
  const { generateBudgetAllocation, budgetAllocation: aiBudget, loading } = useAIPersonalization()

  // Load AI budget allocation
  useEffect(() => {
    if (isOpen && tripDetails) {
      loadBudgetAllocation()
    }
  }, [isOpen, tripDetails, totalBudget])

  const loadBudgetAllocation = async () => {
    try {
      const allocation = await generateBudgetAllocation(totalBudget, tripDetails)
      
      if (allocation) {
        const categories: Record<string, BudgetCategory> = {}
        
        // Format AI response
        Object.entries(allocation).forEach(([key, value]: [string, any]) => {
          if (value.amount && value.percentage) {
            categories[key] = {
              name: key.charAt(0).toUpperCase() + key.slice(1),
              amount: value.amount,
              percentage: value.percentage,
              reasoning: value.reasoning,
              icon: getCategoryIcon(key),
              color: getCategoryColor(key),
              suggestions: []
            }
          }
        })
        
        setBudgetAllocation(categories)
        setOptimizations(allocation.budgetOptimizations || [])
        setPersonalizedTips(allocation.personalizedTips || [])
      }
    } catch (error) {
      console.error('Failed to load budget allocation:', error)
      setBudgetAllocation(getDefaultBudgetAllocation())
    }
  }

  const getDefaultBudgetAllocation = (): Record<string, BudgetCategory> => {
    return {
      accommodation: {
        name: 'Accommodation',
        amount: totalBudget * 0.4,
        percentage: 40,
        reasoning: 'Standard allocation for comfortable stays',
        icon: '🏨',
        color: 'from-blue-400 to-blue-600',
        suggestions: ['Book early for better rates', 'Consider vacation rentals']
      },
      food: {
        name: 'Food & Dining',
        amount: totalBudget * 0.3,
        percentage: 30,
        reasoning: 'Balanced mix of dining experiences',
        icon: '🍽️',
        color: 'from-orange-400 to-red-500',
        suggestions: ['Try local street food', 'Mix high-end and casual dining']
      },
      activities: {
        name: 'Activities',
        amount: totalBudget * 0.2,
        percentage: 20,
        reasoning: 'Mix of paid attractions and free exploration',
        icon: '🎯',
        color: 'from-green-400 to-teal-500',
        suggestions: ['Book popular attractions in advance', 'Look for free walking tours']
      },
      transport: {
        name: 'Transportation',
        amount: totalBudget * 0.1,
        percentage: 10,
        reasoning: 'Local transportation and transfers',
        icon: '🚗',
        color: 'from-purple-400 to-indigo-500',
        suggestions: ['Use public transport', 'Walk when possible']
      }
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      accommodation: '🏨',
      food: '🍽️',
      activities: '🎯',
      transport: '🚗',
      shopping: '🛍️',
      emergency: '🚨'
    }
    return icons[category] || '💰'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      accommodation: 'from-blue-400 to-blue-600',
      food: 'from-orange-400 to-red-500',
      activities: 'from-green-400 to-teal-500',
      transport: 'from-purple-400 to-indigo-500',
      shopping: 'from-pink-400 to-rose-500',
      emergency: 'from-red-400 to-red-600'
    }
    return colors[category] || 'from-gray-400 to-gray-600'
  }

  const updateCategoryBudget = (category: string, newAmount: number) => {
    const newPercentage = (newAmount / totalBudget) * 100
    
    setBudgetAllocation(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        amount: newAmount,
        percentage: newPercentage
      }
    }))
  }

  const handleTotalBudgetChange = (newTotal: number) => {
    setTotalBudget(newTotal)
    
    // Proportionally adjust all categories
    setBudgetAllocation(prev => {
      const updated: Record<string, BudgetCategory> = {}
      Object.entries(prev).forEach(([key, category]) => {
        updated[key] = {
          ...category,
          amount: (category.percentage / 100) * newTotal
        }
      })
      return updated
    })
  }

  const applyOptimization = (optimization: string) => {
    // Simple optimization logic - would be more sophisticated in production
    if (optimization.includes('accommodation')) {
      const accommodationCategory = budgetAllocation.accommodation
      if (accommodationCategory) {
        const savings = accommodationCategory.amount * 0.15
        updateCategoryBudget('accommodation', accommodationCategory.amount - savings)
        updateCategoryBudget('activities', budgetAllocation.activities.amount + savings)
      }
    }
  }

  // Animation for modal
  const modalAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 300, friction: 30 }
  })

  if (!isOpen) return null

  const totalAllocated = Object.values(budgetAllocation).reduce((sum, cat) => sum + cat.amount, 0)
  const budgetDifference = totalBudget - totalAllocated

  return (
    <animated.div
      style={modalAnimation}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Smart Budget Planner</h2>
                <p className="text-white/70">AI-optimized allocation for your {tripDetails?.selectedMood?.name} trip</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Total Budget Control */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-xl">Total Budget</h3>
              <div className={`text-sm px-3 py-1 rounded-full ${
                Math.abs(budgetDifference) < 50 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-orange-500/20 text-orange-300'
              }`}>
                {budgetDifference > 0 ? `+$${budgetDifference.toFixed(0)} remaining` : `$${Math.abs(budgetDifference).toFixed(0)} over budget`}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DollarSign className="w-6 h-6 text-white/70" />
              <input
                type="range"
                min="500"
                max="20000"
                step="100"
                value={totalBudget}
                onChange={(e) => handleTotalBudgetChange(parseInt(e.target.value))}
                className="flex-1 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-white font-bold text-2xl min-w-[120px] text-right">
                ${totalBudget.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(budgetAllocation).map(([key, category]) => (
              <div
                key={key}
                className={`bg-white/5 rounded-2xl p-6 border transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                  selectedCategory === key ? 'border-white/30 bg-white/10' : 'border-white/10'
                }`}
                onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-xl`}>
                      {category.icon}
                    </div>
                    <h4 className="text-white font-semibold text-lg">{category.name}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">${category.amount.toFixed(0)}</div>
                    <div className="text-white/70 text-sm">{category.percentage.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={totalBudget}
                    step="50"
                    value={category.amount}
                    onChange={(e) => updateCategoryBudget(key, parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${category.color.split(' ')[1]} 0%, ${category.color.split(' ')[3]} 100%)`
                    }}
                  />
                </div>

                {/* AI Reasoning */}
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-white/70 text-sm font-medium">AI Reasoning:</span>
                  </div>
                  <p className="text-white/60 text-sm">{category.reasoning}</p>
                </div>

                {/* Expanded Details */}
                {selectedCategory === key && category.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-white font-medium text-sm">Smart Tips:</h5>
                    {category.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white/70 text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Optimizations */}
          {optimizations.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-white font-semibold text-xl">AI Budget Optimizations</h3>
                </div>
                <button
                  onClick={() => setShowOptimizations(!showOptimizations)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                >
                  {showOptimizations ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {showOptimizations && (
                <div className="space-y-3">
                  {optimizations.map((optimization, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm mb-2">{optimization}</p>
                        <button
                          onClick={() => applyOptimization(optimization)}
                          className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                        >
                          Apply Optimization
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Personalized Tips */}
          {personalizedTips.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-semibold text-xl">Personalized Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalizedTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/80 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Summary */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-xl mb-4">Budget Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</div>
                <div className="text-white/70 text-sm">Total Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${totalAllocated.toFixed(0)}</div>
                <div className="text-white/70 text-sm">Allocated</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${budgetDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(budgetDifference).toFixed(0)}
                </div>
                <div className="text-white/70 text-sm">
                  {budgetDifference >= 0 ? 'Remaining' : 'Over Budget'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${(totalBudget / (tripDetails?.travelers || 1)).toFixed(0)}
                </div>
                <div className="text-white/70 text-sm">Per Person</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Math.abs(budgetDifference) < 50 ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Budget is well balanced!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Consider adjusting allocation</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBudgetUpdate({ totalBudget, allocation: budgetAllocation })
                  onClose()
                }}
                className="bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200"
              >
                Apply Budget Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </animated.div>
  )
}

export default SmartBudgetPlanner