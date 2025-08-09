// hooks/useExternalAPIs.js
// React hooks for external API integrations

import { useState, useCallback, useEffect } from 'react'
import { 
  getCurrentWeather, 
  getTripWeather, 
  getTripWeatherSummary,
  weatherService 
} from '../lib/weather'
import { 
  searchDestinations, 
  searchPlaces, 
  getPlaceDetails,
  placesService 
} from '../lib/places'

// Hook for weather data
export const useWeather = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [tripWeather, setTripWeather] = useState(null)
  const [weatherSummary, setWeatherSummary] = useState(null)

  // Get current weather for a destination
  const fetchCurrentWeather = useCallback(async (destination) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🌤️ Fetching current weather for:', destination)
      const weather = await getCurrentWeather(destination)
      setCurrentWeather(weather)
      console.log('✅ Current weather loaded:', weather)
      return weather
    } catch (err) {
      const errorMessage = err.message || 'Failed to get current weather'
      setError(errorMessage)
      console.error('❌ Weather error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Get weather forecast for trip dates
  const fetchTripWeather = useCallback(async (destination, startDate, endDate) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🗓️ Fetching trip weather:', { destination, startDate, endDate })
      const weather = await getTripWeather(destination, startDate, endDate)
      setTripWeather(weather)
      console.log('✅ Trip weather loaded:', weather.length, 'days')
      return weather
    } catch (err) {
      const errorMessage = err.message || 'Failed to get trip weather'
      setError(errorMessage)
      console.error('❌ Trip weather error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Get comprehensive weather summary for trip
  const fetchWeatherSummary = useCallback(async (destination, startDate, endDate) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📊 Fetching weather summary:', { destination, startDate, endDate })
      const summary = await getTripWeatherSummary(destination, startDate, endDate)
      setWeatherSummary(summary)
      console.log('✅ Weather summary loaded:', summary)
      return summary
    } catch (err) {
      const errorMessage = err.message || 'Failed to get weather summary'
      setError(errorMessage)
      console.error('❌ Weather summary error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear all weather data
  const clearWeatherData = useCallback(() => {
    setCurrentWeather(null)
    setTripWeather(null)
    setWeatherSummary(null)
    setError(null)
  }, [])

  // Check if weather API is configured
  const isWeatherConfigured = useCallback(() => {
    return weatherService.isConfigured()
  }, [])

  return {
    // State
    loading,
    error,
    currentWeather,
    tripWeather,
    weatherSummary,
    
    // Actions
    fetchCurrentWeather,
    fetchTripWeather,
    fetchWeatherSummary,
    clearWeatherData,
    isWeatherConfigured,
    
    // Utilities
    hasWeatherData: !!(currentWeather || tripWeather || weatherSummary),
    isConfigured: isWeatherConfigured()
  }
}

// Hook for destination search
export const useDestinationSearch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])

  // Search for destinations with autocomplete
  const searchDestination = useCallback(async (query, options = {}) => {
    // Don't search for very short queries
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return []
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Searching destinations:', query)
      const results = await searchDestinations(query, {
        limit: 8,
        ...options
      })
      
      setSearchResults(results)
      console.log('✅ Found destinations:', results.length)
      return results
    } catch (err) {
      const errorMessage = err.message || 'Failed to search destinations'
      setError(errorMessage)
      console.error('❌ Destination search error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Search for any places (broader than just destinations)
  const searchAnyPlace = useCallback(async (query, options = {}) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return []
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('🌍 Searching places:', query)
      const results = await searchPlaces(query, {
        limit: 10,
        ...options
      })
      
      setSearchResults(results)
      console.log('✅ Found places:', results.length)
      return results
    } catch (err) {
      const errorMessage = err.message || 'Failed to search places'
      setError(errorMessage)
      console.error('❌ Place search error:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get detailed information about a place
  const fetchPlaceDetails = useCallback(async (placeId) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📍 Fetching place details:', placeId)
      const details = await getPlaceDetails(placeId)
      setSelectedPlace(details)
      console.log('✅ Place details loaded:', details)
      return details
    } catch (err) {
      const errorMessage = err.message || 'Failed to get place details'
      setError(errorMessage)
      console.error('❌ Place details error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Select a place from search results
  const selectPlace = useCallback((place) => {
    setSelectedPlace(place)
    
    // Add to search history (avoid duplicates)
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.id !== place.id)
      return [place, ...filtered].slice(0, 10) // Keep last 10 searches
    })
    
    console.log('📌 Selected place:', place.displayName)
  }, [])

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([])
    setError(null)
  }, [])

  // Clear selected place
  const clearSelection = useCallback(() => {
    setSelectedPlace(null)
  }, [])

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([])
  }, [])

  // Check if places API is configured
  const isPlacesConfigured = useCallback(() => {
    return placesService.isConfigured()
  }, [])

  // Debounced search function
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  const debouncedSearch = useCallback((query, options = {}, delay = 300) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      searchDestination(query, options)
    }, delay)
    
    setSearchTimeout(timeout)
    
    // Cleanup function
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchDestination, searchTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return {
    // State
    loading,
    error,
    searchResults,
    selectedPlace,
    searchHistory,
    
    // Actions
    searchDestination,
    searchAnyPlace,
    fetchPlaceDetails,
    selectPlace,
    clearSearch,
    clearSelection,
    clearHistory,
    debouncedSearch,
    isPlacesConfigured,
    
    // Utilities
    hasResults: searchResults.length > 0,
    hasSelection: !!selectedPlace,
    hasHistory: searchHistory.length > 0,
    isConfigured: isPlacesConfigured()
  }
}

// Combined hook for travel planning (uses both weather and places)
export const useTravelPlanning = () => {
  const weather = useWeather()
  const places = useDestinationSearch()
  
  const [planningData, setPlanningData] = useState({
    destination: null,
    startDate: null,
    endDate: null,
    weather: null,
    isComplete: false
  })

  // Plan a trip with destination and dates
  const planTrip = useCallback(async (destination, startDate, endDate) => {
    console.log('🧳 Planning trip:', { destination, startDate, endDate })
    
    try {
      // Get weather for the trip
      const weatherData = await weather.fetchTripWeather(destination, startDate, endDate)
      
      // Update planning data
      setPlanningData({
        destination,
        startDate,
        endDate,
        weather: weatherData,
        isComplete: !!(destination && startDate && endDate && weatherData)
      })
      
      console.log('✅ Trip planned successfully')
      return {
        destination,
        startDate,
        endDate,
        weather: weatherData
      }
    } catch (error) {
      console.error('❌ Trip planning failed:', error)
      throw error
    }
  }, [weather])

  // Clear planning data
  const clearPlan = useCallback(() => {
    setPlanningData({
      destination: null,
      startDate: null,
      endDate: null,
      weather: null,
      isComplete: false
    })
    weather.clearWeatherData()
    places.clearSelection()
  }, [weather, places])

  return {
    // Combined state
    loading: weather.loading || places.loading,
    error: weather.error || places.error,
    planningData,
    
    // Individual hooks
    weather,
    places,
    
    // Combined actions
    planTrip,
    clearPlan,
    
    // Utilities
    isConfigured: weather.isConfigured && places.isConfigured,
    canPlan: !!(planningData.destination && planningData.startDate && planningData.endDate)
  }
}

// Export individual hooks and combined hook
export default {
  useWeather,
  useDestinationSearch,
  useTravelPlanning
}