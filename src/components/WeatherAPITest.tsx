import React, { useState } from 'react';
import { weatherService, getCurrentWeather, getTripWeather, getTripWeatherSummary } from '../lib/weather';

const WeatherAPITest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<string>('');

  const testCurrentWeather = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setTestType('Current Weather');

    try {
      console.log('🌤️ Testing current weather for Tokyo, Japan...');
      const weather = await getCurrentWeather('Tokyo, Japan');
      setResults(weather);
      console.log('✅ Current weather test successful:', weather);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Current weather test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testTripWeather = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setTestType('Trip Weather');

    try {
      console.log('🗾 Testing trip weather for Tokyo...');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Tomorrow
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5); // 5 days from now

      const weather = await getTripWeather(
        'Tokyo, Japan',
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setResults(weather);
      console.log('✅ Trip weather test successful:', weather);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Trip weather test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testWeatherSummary = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setTestType('Weather Summary');

    try {
      console.log('📊 Testing weather summary for Tokyo...');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const summary = await getTripWeatherSummary(
        'Tokyo, Japan',
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setResults(summary);
      console.log('✅ Weather summary test successful:', summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Weather summary test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAPIConfiguration = () => {
    const isConfigured = weatherService.isConfigured();
    setTestType('API Configuration');
    setResults({
      configured: isConfigured,
      message: isConfigured 
        ? 'Weather API is properly configured!' 
        : 'Weather API key is missing or not configured'
    });
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
    setTestType('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🌤️ Weather API Test Suite</h2>
        <p className="text-white/80">Test your OpenWeatherMap API integration</p>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={testCurrentWeather}
          disabled={loading}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && testType === 'Current Weather' ? 'Testing...' : 'Current Weather'}
        </button>
        
        <button
          onClick={testTripWeather}
          disabled={loading}
          className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && testType === 'Trip Weather' ? 'Testing...' : 'Trip Forecast'}
        </button>
        
        <button
          onClick={testWeatherSummary}
          disabled={loading}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && testType === 'Weather Summary' ? 'Testing...' : 'Trip Summary'}
        </button>
        
        <button
          onClick={testAPIConfiguration}
          disabled={loading}
          className="bg-orange-500/20 hover:bg-orange-500/30 text-white px-4 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Config
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={clearResults}
          disabled={loading}
          className="bg-gray-500/20 hover:bg-gray-500/30 text-white px-6 py-2 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Results
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-200">🌤️ Fetching weather data from OpenWeatherMap...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <h3 className="text-red-200 font-semibold mb-2">❌ Test Failed:</h3>
          <p className="text-red-200">{error}</p>
          <div className="mt-3 text-red-200/80 text-sm">
            <p>💡 <strong>Troubleshooting tips:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check if your OpenWeatherMap API key is set in the environment</li>
              <li>Verify your API key is valid and active</li>
              <li>Ensure you have internet connectivity</li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <h3 className="text-green-200 font-semibold text-xl mb-4">
            ✅ {testType} Test Results:
          </h3>
          
          {/* Current Weather Results */}
          {testType === 'Current Weather' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <div className="text-3xl mb-2">{results.icon}</div>
                  <div className="text-white font-semibold text-2xl">{results.temperature}°C</div>
                  <div className="text-white/70 text-sm">Temperature</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <div className="text-white font-semibold text-lg capitalize">{results.condition}</div>
                  <div className="text-white/70 text-sm">{results.description}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-center">
                  <div className="text-white font-semibold text-lg">{results.humidity}%</div>
                  <div className="text-white/70 text-sm">Humidity</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-white/70">Feels like:</span>
                  <p className="text-white font-medium">{results.feelsLike}°C</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-white/70">Wind:</span>
                  <p className="text-white font-medium">{results.windSpeed} km/h</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-white/70">Sunrise:</span>
                  <p className="text-white font-medium">{results.sunrise}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-white/70">Sunset:</span>
                  <p className="text-white font-medium">{results.sunset}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Weather Results */}
          {testType === 'Trip Weather' && Array.isArray(results) && (
            <div className="space-y-4">
              <p className="text-green-200">📅 {results.length} days of weather forecast:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.slice(0, 4).map((day: any, index: number) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{day.day}</h4>
                      <span className="text-2xl">{day.dayWeather.icon}</span>
                    </div>
                    <div className="text-white/80 text-sm">
                      <p>Day: {day.dayWeather.temperature}°C - {day.dayWeather.description}</p>
                      <p>Night: {day.nightWeather.temperature}°C</p>
                      <p>Rain chance: {day.chanceOfRain}%</p>
                    </div>
                  </div>
                ))}
              </div>
              {results.length > 4 && (
                <p className="text-green-200/80 text-center">... and {results.length - 4} more days</p>
              )}
            </div>
          )}

          {/* Weather Summary Results */}
          {testType === 'Weather Summary' && results.summary && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-medium mb-2">Trip Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Avg Temp:</span>
                    <p className="text-white font-medium">{results.summary.avgTemperature}°C</p>
                  </div>
                  <div>
                    <span className="text-white/70">Max Temp:</span>
                    <p className="text-white font-medium">{results.summary.maxTemperature}°C</p>
                  </div>
                  <div>
                    <span className="text-white/70">Min Temp:</span>
                    <p className="text-white font-medium">{results.summary.minTemperature}°C</p>
                  </div>
                  <div>
                    <span className="text-white/70">Rain Chance:</span>
                    <p className="text-white font-medium">{results.summary.averageRainChance}%</p>
                  </div>
                </div>
                <p className="text-white/80 mt-2">{results.summary.description}</p>
              </div>

              {results.packingRecommendations && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-medium mb-2">🎒 Packing Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {results.packingRecommendations.map((item: string, index: number) => (
                      <div key={index} className="text-white/80 text-sm">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Configuration Results */}
          {testType === 'API Configuration' && (
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-2xl mb-2">{results.configured ? '✅' : '❌'}</div>
              <p className="text-white font-medium">{results.message}</p>
              {!results.configured && (
                <p className="text-white/70 text-sm mt-2">
                  Add your OpenWeatherMap API key to the environment variables
                </p>
              )}
            </div>
          )}

          {/* Raw JSON (collapsible) */}
          <details className="mt-4">
            <summary className="text-green-200/80 cursor-pointer hover:text-green-200 transition-colors">
              View Raw API Response
            </summary>
            <pre className="mt-2 p-4 bg-black/20 rounded-xl text-xs text-white/70 overflow-auto max-h-60">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* API Status */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
        <h3 className="text-white font-semibold mb-2">🔧 API Status:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-white/70">Configuration</p>
            <p className="text-white font-medium">
              {weatherService.isConfigured() ? '✅ Ready' : '❌ Missing Key'}
            </p>
          </div>
          <div>
            <p className="text-white/70">Last Test</p>
            <p className="text-white font-medium">{testType || '❌ None'}</p>
          </div>
          <div>
            <p className="text-white/70">Status</p>
            <p className="text-white font-medium">
              {loading ? '🔄 Testing' : error ? '❌ Error' : results ? '✅ Success' : '⏳ Ready'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAPITest;