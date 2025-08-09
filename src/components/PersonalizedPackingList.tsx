import React, { useState, useEffect } from 'react'
import { Package, Check, Plus, X, Brain, Thermometer, Cloud, Sun, Shirt, Smartphone, Heart, Lightbulb } from 'lucide-react'
import { useAIPersonalization } from '../hooks/useAIPersonalization'
import { useSpring, animated } from 'react-spring'

interface PackingListProps {
  tripDetails: any
  weatherData: any
  isOpen: boolean
  onClose: () => void
}

interface PackingItem {
  item: string
  reason: string
  category: string
  packed: boolean
  essential: boolean
  personalized: boolean
}

const PersonalizedPackingList: React.FC<PackingListProps> = ({ 
  tripDetails, 
  weatherData, 
  isOpen, 
  onClose 
}) => {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [customItem, setCustomItem] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [packingProgress, setPackingProgress] = useState(0)
  const [showReasons, setShowReasons] = useState(true)
  
  const { generatePackingList, packingList, loading } = useAIPersonalization()

  // Load packing list when modal opens
  useEffect(() => {
    if (isOpen && tripDetails) {
      loadPackingList()
    }
  }, [isOpen, tripDetails, weatherData])

  // Calculate packing progress
  useEffect(() => {
    const packedCount = packingItems.filter(item => item.packed).length
    const progress = packingItems.length > 0 ? (packedCount / packingItems.length) * 100 : 0
    setPackingProgress(progress)
  }, [packingItems])

  const loadPackingList = async () => {
    try {
      const aiPackingList = await generatePackingList(tripDetails, weatherData)
      
      if (aiPackingList) {
        const formattedItems: PackingItem[] = []
        
        // Process each category
        Object.entries(aiPackingList).forEach(([category, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              formattedItems.push({
                item: item.item || item,
                reason: item.reason || `Essential for ${category}`,
                category,
                packed: false,
                essential: category === 'essentials',
                personalized: true
              })
            })
          }
        })
        
        setPackingItems(formattedItems)
      }
    } catch (error) {
      console.error('Failed to load packing list:', error)
      setPackingItems(getDefaultPackingItems())
    }
  }

  const getDefaultPackingItems = (): PackingItem[] => {
    return [
      { item: 'Passport', reason: 'Required for international travel', category: 'essentials', packed: false, essential: true, personalized: false },
      { item: 'Phone charger', reason: 'Stay connected during your trip', category: 'electronics', packed: false, essential: true, personalized: false },
      { item: 'Comfortable walking shoes', reason: 'Essential for exploring', category: 'clothing', packed: false, essential: true, personalized: false },
      { item: 'Sunscreen', reason: 'Protect from sun exposure', category: 'personalItems', packed: false, essential: false, personalized: false }
    ]
  }

  const toggleItemPacked = (index: number) => {
    setPackingItems(prev => prev.map((item, i) => 
      i === index ? { ...item, packed: !item.packed } : item
    ))
  }

  const addCustomItem = () => {
    if (!customItem.trim()) return
    
    const newItem: PackingItem = {
      item: customItem,
      reason: 'Added by you',
      category: 'custom',
      packed: false,
      essential: false,
      personalized: false
    }
    
    setPackingItems(prev => [...prev, newItem])
    setCustomItem('')
  }

  const removeItem = (index: number) => {
    setPackingItems(prev => prev.filter((_, i) => i !== index))
  }

  const categories = [
    { id: 'all', label: 'All Items', icon: '📦' },
    { id: 'essentials', label: 'Essentials', icon: '⭐' },
    { id: 'clothing', label: 'Clothing', icon: '👕' },
    { id: 'electronics', label: 'Electronics', icon: '📱' },
    { id: 'personalItems', label: 'Personal', icon: '🧴' },
    { id: 'activitySpecific', label: 'Activities', icon: '🎯' },
    { id: 'custom', label: 'Custom', icon: '✏️' }
  ]

  const filteredItems = selectedCategory === 'all' 
    ? packingItems 
    : packingItems.filter(item => item.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    const icons = {
      essentials: <Heart className="w-4 h-4" />,
      clothing: <Shirt className="w-4 h-4" />,
      electronics: <Smartphone className="w-4 h-4" />,
      personalItems: <Package className="w-4 h-4" />,
      activitySpecific: <Sun className="w-4 h-4" />,
      custom: <Plus className="w-4 h-4" />
    }
    return icons[category as keyof typeof icons] || <Package className="w-4 h-4" />
  }

  // Animation for modal
  const modalAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 300, friction: 30 }
  })

  // Animation for progress bar
  const progressAnimation = useSpring({
    width: packingProgress,
    from: { width: 0 },
    config: { duration: 500 }
  })

  if (!isOpen) return null

  return (
    <animated.div
      style={modalAnimation}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Smart Packing List</h2>
                <p className="text-white/70">Personalized for your {tripDetails?.selectedMood?.name} trip</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-semibold">{Math.round(packingProgress)}% Complete</div>
                <div className="text-white/70 text-sm">
                  {packingItems.filter(item => item.packed).length} of {packingItems.length} items
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
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-white/10 rounded-full h-3">
            <animated.div
              style={progressAnimation}
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-white/20 p-6 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => {
                const categoryCount = packingItems.filter(item => 
                  category.id === 'all' || item.category === category.id
                ).length
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </div>
                      {categoryCount > 0 && (
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                          {categoryCount}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* AI Insights Toggle */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => setShowReasons(!showReasons)}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors duration-200"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm">
                  {showReasons ? 'Hide' : 'Show'} AI Reasoning
                </span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/80">🧠 AI is creating your personalized packing list...</p>
              </div>
            )}

            {/* Items Grid */}
            {!loading && (
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className={`group p-4 rounded-2xl border transition-all duration-300 hover:transform hover:scale-[1.02] ${
                      item.packed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItemPacked(index)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          item.packed
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        {item.packed && <Check className="w-4 h-4 text-white" />}
                      </button>

                      {/* Item Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className={`font-medium ${item.packed ? 'text-white/70 line-through' : 'text-white'}`}>
                              {item.item}
                            </h4>
                            {item.essential && (
                              <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
                                Essential
                              </span>
                            )}
                            {item.personalized && (
                              <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                                <Brain className="w-3 h-3 inline mr-1" />
                                AI
                              </span>
                            )}
                          </div>
                          
                          {item.category === 'custom' && (
                            <button
                              onClick={() => removeItem(index)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-white/60 hover:text-red-400 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {showReasons && (
                          <div className="mt-2 flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-white/60 text-sm">{item.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Item */}
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Item
              </h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                  placeholder="Add something specific to your trip..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button
                  onClick={addCustomItem}
                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white px-4 py-2 rounded-xl transition-all duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* AI Tips */}
            {packingList?.personalizedTips && (
              <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white font-medium">Personalized Tips</h4>
                </div>
                <div className="space-y-2">
                  {packingList.personalizedTips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-purple-400 mt-1">💡</span>
                      <p className="text-white/80 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white/70 text-sm">
                {packingItems.filter(item => item.packed).length} of {packingItems.length} items packed
              </div>
              {packingProgress === 100 && (
                <div className="flex items-center space-x-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">All packed! 🎉</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const packedItems = packingItems.filter(item => item.packed).map(item => item.item)
                  navigator.clipboard.writeText(packedItems.join('\n'))
                  alert('Packed items copied to clipboard!')
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-2xl transition-all duration-200"
              >
                Export List
              </button>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white px-6 py-2 rounded-2xl font-semibold transition-all duration-200"
              >
                Done Packing
              </button>
            </div>
          </div>
        </div>
      </div>
    </animated.div>
  )
}

export default PersonalizedPackingList