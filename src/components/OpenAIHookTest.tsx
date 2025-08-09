import React, { useState } from 'react';
import { useItineraryGeneration } from '../hooks/useOpenAI';

const OpenAIHookTest: React.FC = () => {
  const { generateTrip, loading, error, itinerary, clearResults } = useItineraryGeneration();
  const [testResults, setTestResults] = useState<string>('');

  const runBasicTest = async () => {
    setTestResults('Starting basic test...');
    
    const testTrip = {
      destination: "Paris, France",
      startDate: "2024-06-01",
      endDate: "2024-06-04",
      budget: 1500,
      travelers: 2,
      moods: ["culture", "food", "romance"]
    };

    try {
      const result = await generateTrip(testTrip);
      if (result.success) {
        setTestResults('✅ Basic test passed! AI generated itinerary successfully.');
      } else {
        setTestResults(`❌ Basic test failed: ${result.error}`);
      }
    } catch (err) {
      setTestResults(`❌ Test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const runAdvancedTest = async () => {
    setTestResults('Starting advanced test with different parameters...');
    
    const testTrip = {
      destination: "Tokyo, Japan",
      startDate: "2024-07-15",
      endDate: "2024-07-20",
      budget: 3000,
      travelers: 1,
      moods: ["adventure", "culture", "food"]
    };

    try {
      const result = await generateTrip(testTrip);
      if (result.success) {
        setTestResults('✅ Advanced test passed! AI handled different parameters correctly.');
      } else {
        setTestResults(`❌ Advanced test failed: ${result.error}`);
      }
    } catch (err) {
      setTestResults(`❌ Test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleClearResults = () => {
    clearResults();
    setTestResults('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🤖 OpenAI Hook Test Suite</h2>
        <p className="text-white/80">Test your AI itinerary generation functionality</p>
      </div>

      {/* Test Controls */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={runBasicTest}
          disabled={loading}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Run Basic Test'}
        </button>
        
        <button
          onClick={runAdvancedTest}
          disabled={loading}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Run Advanced Test'}
        </button>
        
        <button
          onClick={handleClearResults}
          disabled={loading}
          className="bg-gray-500/20 hover:bg-gray-500/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Results
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-200">🧠 AI is generating your itinerary... This may take 10-30 seconds</p>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-white font-semibold mb-2">Test Results:</h3>
          <p className="text-white/90">{testResults}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <h3 className="text-red-200 font-semibold mb-2">❌ Error:</h3>
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Generated Itinerary Display */}
      {itinerary && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <h3 className="text-green-200 font-semibold text-xl mb-4">✅ Generated Itinerary:</h3>
          
          {/* Summary */}
          <div className="mb-4 p-4 bg-white/5 rounded-xl">
            <h4 className="text-white font-medium mb-2">Trip Summary:</h4>
            <p className="text-white/90">{itinerary.summary}</p>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">Total Cost:</span>
              <p className="text-white font-semibold">${itinerary.totalCost}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <span className="text-white/70 text-sm">Days:</span>
              <p className="text-white font-semibold">{itinerary.days?.length || 0} days</p>
            </div>
          </div>

          {/* Days Preview */}
          {itinerary.days && itinerary.days.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium">Daily Activities Preview:</h4>
              {itinerary.days.slice(0, 2).map((day: any, index: number) => (
                <div key={index} className="p-3 bg-white/5 rounded-xl">
                  <h5 className="text-white font-medium mb-2">Day {day.day}: {day.theme}</h5>
                  <p className="text-white/80 text-sm">
                    {day.activities?.length || 0} activities planned
                  </p>
                  <p className="text-white/70 text-sm">Budget: ${day.dailyBudget}</p>
                </div>
              ))}
              {itinerary.days.length > 2 && (
                <p className="text-white/60 text-sm text-center">
                  ... and {itinerary.days.length - 2} more days
                </p>
              )}
            </div>
          )}

          {/* Raw JSON (collapsible) */}
          <details className="mt-4">
            <summary className="text-white/80 cursor-pointer hover:text-white transition-colors">
              View Raw JSON Response
            </summary>
            <pre className="mt-2 p-4 bg-black/20 rounded-xl text-xs text-white/70 overflow-auto max-h-60">
              {JSON.stringify(itinerary, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Hook Status */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
        <h3 className="text-white font-semibold mb-2">Hook Status:</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/70 text-sm">Loading</p>
            <p className="text-white font-medium">{loading ? '✅ Active' : '❌ Idle'}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Error</p>
            <p className="text-white font-medium">{error ? '❌ Has Error' : '✅ No Error'}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Itinerary</p>
            <p className="text-white font-medium">{itinerary ? '✅ Generated' : '❌ None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAIHookTest;