# 🌍 Travel App - External API Integration

A comprehensive travel planning application with weather forecasting and destination search capabilities.

## 🚀 Features

### Weather Integration (OpenWeatherMap)
- **Current Weather**: Real-time weather for any destination
- **Trip Forecasts**: 5-day weather forecasts for travel dates
- **Weather Summaries**: Comprehensive trip weather analysis
- **Packing Recommendations**: Smart suggestions based on weather
- **Seasonal Estimates**: Weather predictions for distant trips

### Places Search (Mapbox)
- **Destination Autocomplete**: Smart search with real-time suggestions
- **Location Details**: Coordinates, timezone, and travel info
- **Popular Destinations**: Curated list of travel hotspots
- **Fallback Results**: Offline support with common destinations
- **Travel-Optimized**: Filtered specifically for travel planning

### React Hooks
- **useWeather**: Complete weather data management
- **useDestinationSearch**: Places search with autocomplete
- **useTravelPlanning**: Combined trip planning functionality

## 🔧 Setup Instructions

### 1. Get API Keys (Both Free!)

#### OpenWeatherMap API
1. Visit [openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes: 1,000 calls/day, current weather, 5-day forecast

#### Mapbox Places API
1. Visit [mapbox.com](https://www.mapbox.com/)
2. Sign up for a free account
3. Get your access token from the dashboard
4. Free tier includes: 100,000 requests/month

### 2. Environment Variables

Create a `.env` file in your project root:

```env
# Weather API (OpenWeatherMap)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Places API (Mapbox)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## 📚 Usage Examples

### Weather Hook
```javascript
import { useWeather } from './hooks/useExternalAPIs'

const MyComponent = () => {
  const { fetchCurrentWeather, currentWeather, loading } = useWeather()
  
  const getWeather = async () => {
    await fetchCurrentWeather('Paris, France')
  }
  
  return (
    <div>
      <button onClick={getWeather}>Get Weather</button>
      {currentWeather && (
        <div>
          <h3>{currentWeather.temperature}°C</h3>
          <p>{currentWeather.description}</p>
        </div>
      )}
    </div>
  )
}
```

### Places Search Hook
```javascript
import { useDestinationSearch } from './hooks/useExternalAPIs'

const SearchComponent = () => {
  const { searchDestination, searchResults, selectPlace } = useDestinationSearch()
  
  const handleSearch = (query) => {
    searchDestination(query)
  }
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {searchResults.map(place => (
        <div key={place.id} onClick={() => selectPlace(place)}>
          {place.displayName}
        </div>
      ))}
    </div>
  )
}
```

### Combined Trip Planning
```javascript
import { useTravelPlanning } from './hooks/useExternalAPIs'

const TripPlanner = () => {
  const { planTrip, planningData } = useTravelPlanning()
  
  const handlePlanTrip = async () => {
    await planTrip('Tokyo, Japan', '2024-04-15', '2024-04-20')
  }
  
  return (
    <div>
      <button onClick={handlePlanTrip}>Plan Trip</button>
      {planningData.isComplete && (
        <div>
          <h3>Trip to {planningData.destination}</h3>
          <p>{planningData.weather?.length} days of weather loaded</p>
        </div>
      )}
    </div>
  )
}
```

## 🧪 Testing

The app includes a comprehensive test interface at `/test` that allows you to:

- ✅ Test API configuration
- 🔍 Search for destinations with autocomplete
- 🌤️ Get current weather for any location
- 📅 Get weather forecasts for trip dates
- 📊 Generate weather summaries with packing tips
- 🧳 Test complete trip planning workflow

## 📁 File Structure

```
src/
├── lib/
│   ├── weather.js          # OpenWeatherMap integration
│   └── places.js           # Mapbox Places integration
├── hooks/
│   └── useExternalAPIs.js  # React hooks for APIs
├── components/
│   └── ExternalAPITest.tsx # Test interface
└── App.tsx                 # Main application
```

## 🌟 Features in Detail

### Weather Service
- **Smart Geocoding**: Converts city names to coordinates
- **Date Intelligence**: Real forecasts vs seasonal estimates
- **Rich Data**: Temperature, humidity, wind, rain probability
- **Travel Focus**: Packing tips and activity recommendations
- **Error Handling**: Graceful fallbacks when API fails

### Places Service
- **Autocomplete**: Real-time search suggestions
- **Travel Optimized**: Filters for cities and destinations
- **Rich Metadata**: Coordinates, country codes, timezones
- **Popular Destinations**: Curated travel hotspots
- **Offline Support**: Fallback results for common places

### React Hooks
- **State Management**: Loading, error, and data states
- **Caching**: Prevents unnecessary API calls
- **Debouncing**: Optimized search performance
- **Error Recovery**: Automatic retry and fallback logic

## 🔒 Security Notes

- API keys are stored in environment variables
- Never commit API keys to version control
- Use environment-specific configurations
- Consider rate limiting for production use

## 📈 API Limits

### OpenWeatherMap (Free)
- 1,000 calls per day
- Current weather + 5-day forecast
- No credit card required

### Mapbox (Free)
- 100,000 requests per month
- Geocoding + Places search
- No credit card required for free tier

## 🚀 Production Deployment

1. Set environment variables in your hosting platform
2. Ensure API keys are properly configured
3. Consider implementing request caching
4. Monitor API usage and limits
5. Set up error tracking and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this in your own projects!

---

**Happy Travels! 🧳✈️**