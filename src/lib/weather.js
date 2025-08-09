// lib/weather.js
// Weather API integration for travel app using OpenWeatherMap

class WeatherService {
  constructor() {
    // You'll need to set your OpenWeatherMap API key here
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'your-openweather-api-key-here'
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
    this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0'
  }

  // Get coordinates for a destination (city, country format)
  async getCoordinates(destination) {
    try {
      const response = await fetch(
        `${this.geocodingUrl}/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${this.apiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data || data.length === 0) {
        throw new Error('Location not found')
      }
      
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name,
        country: data[0].country
      }
    } catch (error) {
      console.error('Error getting coordinates:', error)
      throw new Error('Unable to find location coordinates')
    }
  }

  // Get current weather for a destination
  async getCurrentWeather(destination) {
    try {
      const coords = await this.getCoordinates(destination)
      
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric`
      )
      
      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      return this.formatCurrentWeather(data)
    } catch (error) {
      console.error('Error getting current weather:', error)
      return this.getDefaultWeather('current')
    }
  }

  // Get 5-day weather forecast for a destination
  async getWeatherForecast(destination, startDate, endDate) {
    try {
      const coords = await this.getCoordinates(destination)
      
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric`
      )
      
      if (!response.ok) {
        throw new Error(`Forecast API failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      return this.formatForecastData(data, startDate, endDate)
    } catch (error) {
      console.error('Error getting weather forecast:', error)
      return this.getDefaultForecast(startDate, endDate)
    }
  }

  // Get weather for specific trip dates (up to 5 days ahead)
  async getTripWeather(destination, startDate, endDate) {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      
      // Calculate days from today
      const daysFromToday = Math.ceil((start - today) / (1000 * 60 * 60 * 24))
      
      if (daysFromToday > 5) {
        // For trips more than 5 days away, return seasonal averages
        return this.getSeasonalWeather(destination, startDate, endDate)
      }
      
      // For trips within 5 days, get actual forecast
      return await this.getWeatherForecast(destination, startDate, endDate)
    } catch (error) {
      console.error('Error getting trip weather:', error)
      return this.getDefaultForecast(startDate, endDate)
    }
  }

  // Format current weather data
  formatCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main.toLowerCase(),
      description: data.weather[0].description,
      icon: this.getWeatherIcon(data.weather[0].main),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed || 0),
      visibility: Math.round((data.visibility || 10000) / 1000), // Convert to km
      pressure: data.main.pressure,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  // Format forecast data for trip dates
  formatForecastData(data, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const forecast = []
    
    // Group forecast by day
    const dailyForecasts = {}
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000)
      const dateKey = date.toDateString()
      
      if (date >= start && date <= end) {
        if (!dailyForecasts[dateKey]) {
          dailyForecasts[dateKey] = []
        }
        dailyForecasts[dateKey].push(item)
      }
    })
    
    // Process each day
    Object.keys(dailyForecasts).forEach(dateKey => {
      const dayData = dailyForecasts[dateKey]
      const date = new Date(dateKey)
      
      // Get day and night forecasts
      const dayForecast = dayData.find(item => {
        const hour = new Date(item.dt * 1000).getHours()
        return hour >= 12 && hour <= 15 // Afternoon
      }) || dayData[0]
      
      const nightForecast = dayData.find(item => {
        const hour = new Date(item.dt * 1000).getHours()
        return hour >= 18 && hour <= 21 // Evening
      }) || dayData[dayData.length - 1]
      
      forecast.push({
        date: date.toDateString(),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayWeather: {
          temperature: Math.round(dayForecast.main.temp),
          condition: dayForecast.weather[0].main.toLowerCase(),
          description: dayForecast.weather[0].description,
          icon: this.getWeatherIcon(dayForecast.weather[0].main),
          humidity: dayForecast.main.humidity,
          windSpeed: Math.round(dayForecast.wind?.speed || 0)
        },
        nightWeather: {
          temperature: Math.round(nightForecast.main.temp),
          condition: nightForecast.weather[0].main.toLowerCase(),
          description: nightForecast.weather[0].description,
          icon: this.getWeatherIcon(nightForecast.weather[0].main),
          humidity: nightForecast.main.humidity
        },
        // Calculate daily averages
        avgTemp: Math.round(dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length),
        maxTemp: Math.round(Math.max(...dayData.map(item => item.main.temp))),
        minTemp: Math.round(Math.min(...dayData.map(item => item.main.temp))),
        chanceOfRain: Math.max(...dayData.map(item => (item.pop || 0) * 100)),
        recommendations: this.getWeatherRecommendations(dayForecast.weather[0].main, Math.round(dayForecast.main.temp))
      })
    })
    
    return forecast
  }

  // Get seasonal weather estimates for distant trips
  getSeasonalWeather(destination, startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const forecast = []
    
    // Simple seasonal temperature estimates (this could be enhanced with historical data)
    const month = start.getMonth()
    const seasonalTemp = this.getSeasonalTemperature(month, destination)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      forecast.push({
        date: date.toDateString(),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayWeather: {
          temperature: seasonalTemp.day,
          condition: seasonalTemp.condition,
          description: `Typical ${seasonalTemp.season} weather`,
          icon: seasonalTemp.icon,
          humidity: seasonalTemp.humidity,
          windSpeed: seasonalTemp.windSpeed
        },
        nightWeather: {
          temperature: seasonalTemp.night,
          condition: seasonalTemp.condition,
          description: `Typical ${seasonalTemp.season} evening`,
          icon: seasonalTemp.icon,
          humidity: seasonalTemp.humidity
        },
        avgTemp: Math.round((seasonalTemp.day + seasonalTemp.night) / 2),
        maxTemp: seasonalTemp.day + 3,
        minTemp: seasonalTemp.night - 2,
        chanceOfRain: seasonalTemp.rainChance,
        recommendations: this.getWeatherRecommendations(seasonalTemp.condition, seasonalTemp.day),
        isEstimate: true
      })
    }
    
    return forecast
  }

  // Get seasonal temperature estimates
  getSeasonalTemperature(month, destination) {
    // This is a simplified version - in production, you'd use historical weather data
    const isNorthernHemisphere = !destination.toLowerCase().includes('australia') && 
                                !destination.toLowerCase().includes('new zealand') &&
                                !destination.toLowerCase().includes('south africa')
    
    const seasons = {
      winter: { day: 5, night: -2, condition: 'clouds', icon: '☁️', season: 'winter', humidity: 70, windSpeed: 15, rainChance: 40 },
      spring: { day: 18, night: 8, condition: 'clear', icon: '🌤️', season: 'spring', humidity: 60, windSpeed: 10, rainChance: 30 },
      summer: { day: 28, night: 18, condition: 'clear', icon: '☀️', season: 'summer', humidity: 50, windSpeed: 8, rainChance: 20 },
      autumn: { day: 15, night: 5, condition: 'clouds', icon: '🍂', season: 'autumn', humidity: 65, windSpeed: 12, rainChance: 35 }
    }
    
    let season
    if (isNorthernHemisphere) {
      if (month >= 11 || month <= 1) season = 'winter'
      else if (month >= 2 && month <= 4) season = 'spring'
      else if (month >= 5 && month <= 7) season = 'summer'
      else season = 'autumn'
    } else {
      // Southern hemisphere - seasons are opposite
      if (month >= 5 && month <= 7) season = 'winter'
      else if (month >= 8 && month <= 10) season = 'spring'
      else if (month >= 11 || month <= 1) season = 'summer'
      else season = 'autumn'
    }
    
    return seasons[season]
  }

  // Convert weather condition to emoji icon
  getWeatherIcon(condition) {
    const icons = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'drizzle': '🌦️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
      'fog': '🌫️',
      'haze': '🌫️',
      'dust': '🌪️',
      'sand': '🌪️',
      'ash': '🌋',
      'squall': '💨',
      'tornado': '🌪️'
    }
    
    return icons[condition.toLowerCase()] || '🌤️'
  }

  // Get weather-based recommendations
  getWeatherRecommendations(condition, temperature) {
    const recommendations = []
    
    // Temperature-based recommendations
    if (temperature < 5) {
      recommendations.push('Pack warm winter clothing', 'Bring gloves and hat', 'Consider indoor activities')
    } else if (temperature < 15) {
      recommendations.push('Bring layers and a jacket', 'Pack comfortable walking shoes')
    } else if (temperature < 25) {
      recommendations.push('Perfect weather for outdoor activities', 'Light layers recommended')
    } else if (temperature < 35) {
      recommendations.push('Stay hydrated', 'Wear sunscreen', 'Light, breathable clothing')
    } else {
      recommendations.push('Seek shade during midday', 'Drink plenty of water', 'Avoid strenuous outdoor activities')
    }
    
    // Condition-based recommendations
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        recommendations.push('Bring umbrella or rain jacket', 'Waterproof shoes recommended', 'Plan indoor backup activities')
        break
      case 'thunderstorm':
        recommendations.push('Stay indoors during storms', 'Avoid outdoor activities', 'Check local weather alerts')
        break
      case 'snow':
        recommendations.push('Warm, waterproof clothing essential', 'Non-slip footwear', 'Check road conditions')
        break
      case 'clear':
        recommendations.push('Great day for sightseeing', 'Don\'t forget sunscreen', 'Perfect for outdoor dining')
        break
    }
    
    return recommendations.slice(0, 3) // Return top 3 recommendations
  }

  // Default weather when API fails
  getDefaultWeather(type = 'current') {
    if (type === 'current') {
      return {
        temperature: 22,
        feelsLike: 24,
        condition: 'clear',
        description: 'Pleasant weather',
        icon: '🌤️',
        humidity: 60,
        windSpeed: 10,
        visibility: 10,
        pressure: 1013,
        sunrise: '06:30',
        sunset: '19:30'
      }
    }
    
    return [{
      date: new Date().toDateString(),
      day: 'Today',
      dayWeather: {
        temperature: 22,
        condition: 'clear',
        description: 'Pleasant weather',
        icon: '🌤️',
        humidity: 60,
        windSpeed: 10
      },
      nightWeather: {
        temperature: 16,
        condition: 'clear',
        description: 'Clear evening',
        icon: '🌙',
        humidity: 65
      },
      avgTemp: 19,
      maxTemp: 25,
      minTemp: 14,
      chanceOfRain: 10,
      recommendations: ['Great day for sightseeing', 'Don\'t forget sunscreen', 'Perfect for outdoor dining'],
      isDefault: true
    }]
  }

  // Default forecast when API fails
  getDefaultForecast(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const forecast = []
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      forecast.push({
        date: date.toDateString(),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayWeather: {
          temperature: 20 + Math.floor(Math.random() * 10),
          condition: 'clear',
          description: 'Pleasant weather expected',
          icon: '🌤️',
          humidity: 60,
          windSpeed: 8
        },
        nightWeather: {
          temperature: 15 + Math.floor(Math.random() * 8),
          condition: 'clear',
          description: 'Clear evening expected',
          icon: '🌙',
          humidity: 70
        },
        avgTemp: 18 + Math.floor(Math.random() * 8),
        maxTemp: 25 + Math.floor(Math.random() * 5),
        minTemp: 12 + Math.floor(Math.random() * 5),
        chanceOfRain: Math.floor(Math.random() * 30),
        recommendations: ['Weather forecast unavailable', 'Check local conditions', 'Pack for variable weather'],
        isDefault: true
      })
    }
    
    return forecast
  }

  // Utility function to check if API key is configured
  isConfigured() {
    return this.apiKey && this.apiKey !== 'your-openweather-api-key-here'
  }

  // Get weather summary for trip planning
  async getTripWeatherSummary(destination, startDate, endDate) {
    try {
      const forecast = await this.getTripWeather(destination, startDate, endDate)
      
      const avgTemp = Math.round(forecast.reduce((sum, day) => sum + day.avgTemp, 0) / forecast.length)
      const maxTemp = Math.max(...forecast.map(day => day.maxTemp))
      const minTemp = Math.min(...forecast.map(day => day.minTemp))
      const avgRainChance = Math.round(forecast.reduce((sum, day) => sum + day.chanceOfRain, 0) / forecast.length)
      
      // Determine overall conditions
      const conditions = forecast.map(day => day.dayWeather.condition)
      const mostCommonCondition = conditions.sort((a, b) =>
        conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
      ).pop()
      
      return {
        destination,
        startDate,
        endDate,
        summary: {
          avgTemperature: avgTemp,
          maxTemperature: maxTemp,
          minTemperature: minTemp,
          averageRainChance: avgRainChance,
          dominantCondition: mostCommonCondition,
          icon: this.getWeatherIcon(mostCommonCondition),
          description: this.getWeatherDescription(avgTemp, avgRainChance, mostCommonCondition)
        },
        dailyForecast: forecast,
        packingRecommendations: this.getPackingRecommendations(minTemp, maxTemp, avgRainChance, mostCommonCondition),
        bestDays: forecast
          .map((day, index) => ({ ...day, index }))
          .filter(day => day.chanceOfRain < 30 && day.dayWeather.temperature > 15)
          .slice(0, 3),
        worstDays: forecast
          .map((day, index) => ({ ...day, index }))
          .filter(day => day.chanceOfRain > 60 || day.dayWeather.temperature < 10)
          .slice(0, 2)
      }
    } catch (error) {
      console.error('Error getting trip weather summary:', error)
      throw new Error('Unable to get weather summary for your trip')
    }
  }

  // Generate weather description
  getWeatherDescription(avgTemp, rainChance, condition) {
    let description = ''
    
    if (avgTemp < 10) description += 'Cold weather expected'
    else if (avgTemp < 20) description += 'Cool and comfortable'
    else if (avgTemp < 30) description += 'Warm and pleasant'
    else description += 'Hot weather expected'
    
    if (rainChance > 60) description += ' with frequent rain'
    else if (rainChance > 30) description += ' with occasional showers'
    else description += ' with mostly clear skies'
    
    return description
  }

  // Get packing recommendations based on weather
  getPackingRecommendations(minTemp, maxTemp, rainChance, condition) {
    const recommendations = []
    
    // Temperature-based packing
    if (minTemp < 5) {
      recommendations.push('Heavy winter coat', 'Warm boots', 'Gloves and hat', 'Thermal underwear')
    } else if (minTemp < 15) {
      recommendations.push('Warm jacket', 'Long pants', 'Closed shoes', 'Light sweater')
    }
    
    if (maxTemp > 25) {
      recommendations.push('Light, breathable clothing', 'Sunscreen', 'Hat for sun protection', 'Comfortable sandals')
    }
    
    // Rain-based packing
    if (rainChance > 50) {
      recommendations.push('Waterproof jacket', 'Umbrella', 'Waterproof shoes', 'Quick-dry clothing')
    } else if (rainChance > 25) {
      recommendations.push('Light rain jacket', 'Compact umbrella')
    }
    
    // General recommendations
    recommendations.push('Layers for temperature changes', 'Comfortable walking shoes')
    
    return [...new Set(recommendations)] // Remove duplicates
  }
}

// Create and export weather service instance
export const weatherService = new WeatherService()

// Export individual functions for convenience
export const getCurrentWeather = (destination) => weatherService.getCurrentWeather(destination)
export const getWeatherForecast = (destination, startDate, endDate) => weatherService.getWeatherForecast(destination, startDate, endDate)
export const getTripWeather = (destination, startDate, endDate) => weatherService.getTripWeather(destination, startDate, endDate)
export const getTripWeatherSummary = (destination, startDate, endDate) => weatherService.getTripWeatherSummary(destination, startDate, endDate)

// Export the service class for advanced usage
export { WeatherService }