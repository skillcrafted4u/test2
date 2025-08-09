// components/OpenAITest.js
import React, { useState } from 'react'
import { useItineraryGeneration } from '../hooks/useOpenAI'

const OpenAITest = () => {
  const { generateTrip, loading, error, itinerary } = useItineraryGeneration()
  
  // Test with sample data
  const runTest = () => {
    const sampleTrip = {
      destination: "Tokyo, Japan",
      startDate: "2024-05-01",
      endDate: "2024-05-05",
      budget: 2000,
      travelers: 1,
      moods: ["culture", "food", "adventure"]
    }
    
    generateTrip(sampleTrip)
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🤖 OpenAI Test</h2>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Creating Amazing Trip... ✨' : 'Test AI Trip Generation'}
      </button>
      
      {/* Loading state */}
      {loading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">🧠 AI is thinking... This takes about 10-30 seconds</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}
      
      {/* Success state */}
      {itinerary && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Trip Generated Successfully!
          </h3>
          <p className="text-green-700 mb-4">{itinerary.summary}</p>
          
          <div className="bg-white p-4 rounded border">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(itinerary, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default OpenAITest