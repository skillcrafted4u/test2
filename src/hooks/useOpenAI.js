// hooks/useOpenAI.js
import { useState } from 'react'
import { generateItinerary } from '../lib/openai'

// Custom hook that makes it easy to use OpenAI in your components
export const useItineraryGeneration = () => {
  // State to track what's happening
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [itinerary, setItinerary] = useState(null)

  // Function your components will call to generate trips
  const generateTrip = async (tripData) => {
    // Reset previous state
    setLoading(true)
    setError(null)
    setItinerary(null)
    
    try {
      console.log('🚀 Starting trip generation...')
      
      // Convert selectedMood object to moods array for OpenAI
      const processedTripData = {
        ...tripData,
        moods: tripData.selectedMood ? [tripData.selectedMood.name] : ['adventure']
      }
      
      // Call our OpenAI function
      const result = await generateItinerary(processedTripData)
      
      if (result.success) {
        setItinerary(result.data)
        console.log('🎉 Trip generated successfully!')
      } else {
        setError(result.error)
        console.log('❌ Trip generation failed:', result.error)
      }
      
      return result
      
    } catch (err) {
      const errorMessage = 'Something went wrong generating your trip. Please try again!'
      setError(errorMessage)
      console.error('Unexpected error:', err)
      
      return {
        success: false,
        data: null,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  // Return everything components need
  return {
    generateTrip,
    loading,
    error,
    itinerary,
    // Helper to clear previous results
    clearResults: () => {
      setError(null)
      setItinerary(null)
    }
  }
}