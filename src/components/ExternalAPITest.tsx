import React, { useState } from 'react'
import { useWeather, useDestinationSearch, useTravelPlanning } from '../hooks/useExternalAPIs'
import { Search, MapPin, Calendar, Thermometer, Cloud, Sun, CloudRain, Wind, Eye, Droplets } from 'lucide-react'

const ExternalAPITest: React.FC = () => {
  // Hooks
  const weather = useWeather()
  const places = useDestinationSearch()
  const travelPlanning = useTravelPlanning()
  
  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Set default dates (today and 7 days from now)
  React.useEffect(() => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    
    setStartDate(today.toISOString().split('T')[0])
    setEndDate(nextWeek.toISOString().split('T')[0])
  }, [])

  // Handle destination search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      await places.searchDestination(query)
    } else {
      places.clearSearch()
    }
  }

  // Handle destination selection
  const handleDestinationSelect = (place: any) => {
    places.selectPlace(place)
    setSelectedDestination(place.displayName)
    setSearchQuery(place.displayName)
    places.clearSearch()
  }

  // Test current weather
  const testCurrentWeather = async () => {
    if (!selectedDestination) {
      alert('Please select a destination first')
      return
    }
    await weather.fetchCurrentWeather(selectedDestination)
  }

  // Test trip weather
  const testTripWeather = async () => {
    if (!selectedDestination || !startDate || !endDate) {
      alert('Please select destination and dates')
      return
    }
    await weather.fetchTripWeather(selectedDestination, startDate, endDate)
  }

  // Test weather summary
  const testWeatherSummary = async () => {
    if (!selectedDestination || !startDate || !endDate) {
      alert('Please select destination and dates')
      return
    }
    await weather.fetchWeatherSummary(selectedDestination, startDate, endDate)
  }

  // Test complete trip planning
  const testTripPlanning = async () => {
    if (!selectedDestination || !startDate || !endDate) {
      alert('Please select destination and dates')
      return
    }
    await travelPlanning.planTrip(selectedDestination, startDate, endDate)
  }

  // Clear all data
  const clearAllData = () => {
    weather.clearWeatherData()
    places.clearSearch()
    places.clearSelection()
    travelPlanning.clearPlan()
    setSearchQuery('')
    setSelectedDestination('')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🌍 External API Test Suite</h1>
        <p className="text-white/80 text-lg">Test your weather and places search integrations</p>
      </div>

      {/* API Configuration Status */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">🔧 API Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${weather.isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">OpenWeatherMap API</span>
            </div>
            <p className="text-white/70 text-sm mt-2">
              {weather.isConfigured ? '✅ Configured' : '❌ API key needed'}
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${places.isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">Mapbox Places API</span>
            </div>
            <p className="text-white/70 text-sm mt-2">
              {places.isConfigured ? '✅ Configured' : '❌ Access token needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Destination Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Search className="w-6 h-6 mr-3" />
          Destination Search
        </h2>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for destinations..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            {places.loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {places.hasResults && (
            <div className="bg-white/5 rounded-2xl p-4 max-h-60 overflow-y-auto">
              <h3 className="text-white font-medium mb-3">Search Results:</h3>
              <div className="space-y-2">
                {places.searchResults.map((place, index) => (
                  <button
                    key={place.id || index}
                    onClick={() => handleDestinationSelect(place)}
                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors duration-200 flex items-center space-x-3"
                  >
                    <MapPin className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">{place.name}</div>
                      <div className="text-white/70 text-sm">{place.displayName}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Destination */}
          {places.hasSelection && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <h3 className="text-green-200 font-medium mb-2">✅ Selected Destination:</h3>
              <div className="text-white">
                <div className="font-semibold">{places.selectedPlace?.name}</div>
                <div className="text-white/80">{places.selectedPlace?.displayName}</div>
                <div className="text-white/60 text-sm">
                  📍 {places.selectedPlace?.coordinates.latitude.toFixed(4)}, {places.selectedPlace?.coordinates.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trip Planning Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-3" />
          Trip Planning
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testCurrentWeather}
            disabled={weather.loading || !selectedDestination}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Thermometer className="w-4 h-4" />
            <span>Current Weather</span>
          </button>
          
          <button
            onClick={testTripWeather}
            disabled={weather.loading || !selectedDestination || !startDate || !endDate}
            className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Cloud className="w-4 h-4" />
            <span>Trip Forecast</span>
          </button>
          
          <button
            onClick={testWeatherSummary}
            disabled={weather.loading || !selectedDestination || !startDate || !endDate}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Sun className="w-4 h-4" />
            <span>Weather Summary</span>
          </button>
          
          <button
            onClick={testTripPlanning}
            disabled={travelPlanning.loading || !selectedDestination || !startDate || !endDate}
            className="bg-orange-500/20 hover:bg-orange-500/30 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Plan Trip</span>
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={clearAllData}
            className="bg-gray-500/20 hover:bg-gray-500/30 text-white px-6 py-2 rounded-2xl font-medium transition-all duration-200"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Loading State */}
      {(weather.loading || places.loading || travelPlanning.loading) && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-200">Loading data from external APIs...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(weather.error || places.error) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-red-200 font-semibold mb-2">❌ API Error:</h3>
          <p className="text-red-200">{weather.error || places.error}</p>
        </div>
      )}

      {/* Current Weather Results */}
      {weather.currentWeather && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🌤️ Current Weather</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">{weather.currentWeather.icon}</div>
              <div className="text-white font-bold text-2xl">{weather.currentWeather.temperature}°C</div>
              <div className="text-white/70 text-sm capitalize">{weather.currentWeather.description}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Feels like</span>
              </div>
              <div className="text-white font-semibold">{weather.currentWeather.feelsLike}°C</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Humidity</span>
              </div>
              <div className="text-white font-semibold">{weather.currentWeather.humidity}%</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wind className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">Wind Speed</span>
              </div>
              <div className="text-white font-semibold">{weather.currentWeather.windSpeed} km/h</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <div className="text-white/70 text-sm">Sunrise</div>
              <div className="text-white font-medium">{weather.currentWeather.sunrise}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <div className="text-white/70 text-sm">Sunset</div>
              <div className="text-white font-medium">{weather.currentWeather.sunset}</div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Weather Results */}
      {weather.tripWeather && weather.tripWeather.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📅 Trip Weather Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weather.tripWeather.slice(0, 6).map((day, index) => (
              <div key={index} className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{day.day}</h3>
                  <span className="text-2xl">{day.dayWeather.icon}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Day:</span>
                    <span className="text-white">{day.dayWeather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Night:</span>
                    <span className="text-white">{day.nightWeather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Rain:</span>
                    <span className="text-white">{Math.round(day.chanceOfRain)}%</span>
                  </div>
                </div>
                <div className="mt-3 text-white/80 text-xs capitalize">
                  {day.dayWeather.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Summary Results */}
      {weather.weatherSummary && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Weather Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-medium mb-3">Trip Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Avg Temp:</span>
                    <div className="text-white font-semibold">{weather.weatherSummary.summary.avgTemperature}°C</div>
                  </div>
                  <div>
                    <span className="text-white/70">Max Temp:</span>
                    <div className="text-white font-semibold">{weather.weatherSummary.summary.maxTemperature}°C</div>
                  </div>
                  <div>
                    <span className="text-white/70">Min Temp:</span>
                    <div className="text-white font-semibold">{weather.weatherSummary.summary.minTemperature}°C</div>
                  </div>
                  <div>
                    <span className="text-white/70">Rain Chance:</span>
                    <div className="text-white font-semibold">{weather.weatherSummary.summary.averageRainChance}%</div>
                  </div>
                </div>
                <p className="text-white/80 text-sm mt-3">{weather.weatherSummary.summary.description}</p>
              </div>
            </div>
            <div className="space-y-4">
              {weather.weatherSummary.packingRecommendations && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-white font-medium mb-3">🎒 Packing Tips</h3>
                  <div className="space-y-1">
                    {weather.weatherSummary.packingRecommendations.slice(0, 6).map((item, index) => (
                      <div key={index} className="text-white/80 text-sm">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trip Planning Results */}
      {travelPlanning.planningData.isComplete && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-green-200 mb-4">✅ Trip Planning Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-2">📍 Destination</h3>
              <p className="text-white/80">{travelPlanning.planningData.destination}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-2">📅 Dates</h3>
              <p className="text-white/80">
                {new Date(travelPlanning.planningData.startDate!).toLocaleDateString()} - {new Date(travelPlanning.planningData.endDate!).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <h3 className="text-white font-medium mb-2">🌤️ Weather</h3>
              <p className="text-white/80">
                {travelPlanning.planningData.weather?.length || 0} days of forecast loaded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Setup Instructions */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">🔑 API Setup Instructions</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-white font-medium mb-2">OpenWeatherMap API (Free):</h3>
            <ol className="text-white/80 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">openweathermap.org/api</a></li>
              <li>Sign up for a free account</li>
              <li>Get your API key from the dashboard</li>
              <li>Add <code className="bg-white/10 px-2 py-1 rounded">VITE_OPENWEATHER_API_KEY=your_key_here</code> to your .env file</li>
            </ol>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">Mapbox Places API (Free tier available):</h3>
            <ol className="text-white/80 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">mapbox.com</a></li>
              <li>Sign up for a free account</li>
              <li>Get your access token from the dashboard</li>
              <li>Add <code className="bg-white/10 px-2 py-1 rounded">VITE_MAPBOX_ACCESS_TOKEN=your_token_here</code> to your .env file</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalAPITest