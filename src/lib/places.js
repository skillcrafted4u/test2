// lib/places.js
// Places/Location search API integration using Mapbox Geocoding API

class PlacesService {
  constructor() {
    // Get Mapbox access token from environment variables
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'your-mapbox-token-here'
    this.baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  }

  // Search for places with autocomplete functionality
  async searchPlaces(query, options = {}) {
    try {
      // Validate input
      if (!query || query.trim().length < 2) {
        return []
      }

      const {
        limit = 10,
        types = ['place', 'locality', 'neighborhood', 'address'],
        countries = null, // ISO 3166 alpha 2 country codes (e.g., 'us,ca,mx')
        proximity = null, // [longitude, latitude] for biased results
        bbox = null, // [minX, minY, maxX, maxY] bounding box
        language = 'en'
      } = options

      // Build query parameters
      const params = new URLSearchParams({
        access_token: this.accessToken,
        limit: limit.toString(),
        types: types.join(','),
        language
      })

      if (countries) {
        params.append('country', countries)
      }

      if (proximity && Array.isArray(proximity) && proximity.length === 2) {
        params.append('proximity', proximity.join(','))
      }

      if (bbox && Array.isArray(bbox) && bbox.length === 4) {
        params.append('bbox', bbox.join(','))
      }

      // Make API request
      const encodedQuery = encodeURIComponent(query.trim())
      const url = `${this.baseUrl}/${encodedQuery}.json?${params.toString()}`

      console.log('🔍 Searching places:', query)
      
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Format and return results
      const formattedResults = this.formatSearchResults(data.features || [])
      
      console.log('✅ Found places:', formattedResults.length)
      return formattedResults

    } catch (error) {
      console.error('❌ Places search error:', error)
      return this.handleSearchError(error, query)
    }
  }

  // Get detailed information about a specific place
  async getPlaceDetails(placeId) {
    try {
      const url = `${this.baseUrl}/${placeId}.json?access_token=${this.accessToken}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to get place details: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        return this.formatPlaceDetails(data.features[0])
      }

      return null
    } catch (error) {
      console.error('Error getting place details:', error)
      return null
    }
  }

  // Reverse geocoding - get place from coordinates
  async reverseGeocode(longitude, latitude, options = {}) {
    try {
      const {
        types = ['place', 'locality', 'neighborhood'],
        language = 'en'
      } = options

      const params = new URLSearchParams({
        access_token: this.accessToken,
        types: types.join(','),
        language
      })

      const url = `${this.baseUrl}/${longitude},${latitude}.json?${params.toString()}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        return this.formatPlaceDetails(data.features[0])
      }

      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }

  // Format search results for travel destinations
  formatSearchResults(features) {
    return features.map(feature => {
      const properties = feature.properties || {}
      const context = feature.context || []
      const geometry = feature.geometry || {}
      const coordinates = geometry.coordinates || [0, 0]

      // Extract location hierarchy
      const locationInfo = this.extractLocationInfo(feature)

      return {
        id: feature.id,
        name: feature.text || feature.place_name,
        fullName: feature.place_name,
        displayName: this.createDisplayName(locationInfo),
        coordinates: {
          longitude: coordinates[0],
          latitude: coordinates[1]
        },
        location: locationInfo,
        type: this.getPlaceType(feature),
        relevance: feature.relevance || 0,
        bbox: feature.bbox,
        properties: {
          address: properties.address,
          category: properties.category,
          landmark: properties.landmark,
          wikidata: properties.wikidata,
          short_code: properties.short_code
        },
        // Travel-specific formatting
        travelInfo: {
          isPopularDestination: this.isPopularTravelDestination(feature),
          destinationType: this.getDestinationType(feature),
          searchableText: this.createSearchableText(locationInfo)
        }
      }
    })
  }

  // Format detailed place information
  formatPlaceDetails(feature) {
    const formatted = this.formatSearchResults([feature])[0]
    
    // Add additional details for single place
    return {
      ...formatted,
      details: {
        description: feature.properties?.description,
        website: feature.properties?.website,
        phone: feature.properties?.phone,
        timezone: this.getTimezone(formatted.coordinates),
        population: feature.properties?.population,
        elevation: feature.properties?.elevation
      }
    }
  }

  // Extract hierarchical location information
  extractLocationInfo(feature) {
    const context = feature.context || []
    const info = {
      place: feature.text,
      neighborhood: null,
      locality: null,
      district: null,
      region: null,
      country: null,
      countryCode: null,
      postcode: null
    }

    // Parse context for location hierarchy
    context.forEach(item => {
      const id = item.id || ''
      
      if (id.startsWith('neighborhood')) {
        info.neighborhood = item.text
      } else if (id.startsWith('locality')) {
        info.locality = item.text
      } else if (id.startsWith('place')) {
        if (!info.place || info.place === feature.text) {
          info.place = item.text
        }
      } else if (id.startsWith('district')) {
        info.district = item.text
      } else if (id.startsWith('region')) {
        info.region = item.text
      } else if (id.startsWith('country')) {
        info.country = item.text
        info.countryCode = item.short_code?.toUpperCase()
      } else if (id.startsWith('postcode')) {
        info.postcode = item.text
      }
    })

    return info
  }

  // Create user-friendly display name
  createDisplayName(locationInfo) {
    const parts = []
    
    // Primary location
    if (locationInfo.place) {
      parts.push(locationInfo.place)
    }
    
    // Add region/state if different from place
    if (locationInfo.region && locationInfo.region !== locationInfo.place) {
      parts.push(locationInfo.region)
    }
    
    // Always add country
    if (locationInfo.country) {
      parts.push(locationInfo.country)
    }

    return parts.join(', ')
  }

  // Create searchable text for filtering
  createSearchableText(locationInfo) {
    const parts = [
      locationInfo.place,
      locationInfo.locality,
      locationInfo.region,
      locationInfo.country
    ].filter(Boolean)
    
    return parts.join(' ').toLowerCase()
  }

  // Determine place type for travel purposes
  getPlaceType(feature) {
    const id = feature.id || ''
    
    if (id.startsWith('country')) return 'country'
    if (id.startsWith('region')) return 'region'
    if (id.startsWith('place')) return 'city'
    if (id.startsWith('locality')) return 'town'
    if (id.startsWith('neighborhood')) return 'neighborhood'
    if (id.startsWith('poi')) return 'poi'
    if (id.startsWith('address')) return 'address'
    
    return 'place'
  }

  // Determine destination type for travel planning
  getDestinationType(feature) {
    const properties = feature.properties || {}
    const category = properties.category
    
    if (category) {
      if (category.includes('airport')) return 'airport'
      if (category.includes('hotel')) return 'accommodation'
      if (category.includes('restaurant')) return 'dining'
      if (category.includes('museum')) return 'attraction'
      if (category.includes('park')) return 'nature'
    }
    
    const type = this.getPlaceType(feature)
    if (['country', 'region', 'city', 'town'].includes(type)) {
      return 'destination'
    }
    
    return 'location'
  }

  // Check if place is a popular travel destination
  isPopularTravelDestination(feature) {
    const properties = feature.properties || {}
    const locationInfo = this.extractLocationInfo(feature)
    
    // Check for tourism indicators
    const tourismIndicators = [
      'tourism',
      'attraction',
      'landmark',
      'historic',
      'museum',
      'park',
      'beach',
      'mountain'
    ]
    
    const category = (properties.category || '').toLowerCase()
    const hasTourismCategory = tourismIndicators.some(indicator => 
      category.includes(indicator)
    )
    
    // Popular cities (this could be expanded with a comprehensive list)
    const popularCities = [
      'paris', 'london', 'tokyo', 'new york', 'rome', 'barcelona', 
      'amsterdam', 'berlin', 'madrid', 'vienna', 'prague', 'budapest',
      'istanbul', 'dubai', 'singapore', 'hong kong', 'sydney', 'melbourne',
      'los angeles', 'san francisco', 'chicago', 'miami', 'las vegas',
      'bangkok', 'kyoto', 'seoul', 'taipei', 'mumbai', 'delhi'
    ]
    
    const placeName = (locationInfo.place || '').toLowerCase()
    const isPopularCity = popularCities.includes(placeName)
    
    return hasTourismCategory || isPopularCity || feature.relevance > 0.8
  }

  // Get approximate timezone (simplified)
  getTimezone(coordinates) {
    // This is a simplified timezone detection
    // In production, you might want to use a dedicated timezone API
    const longitude = coordinates.longitude
    
    if (longitude >= -180 && longitude < -165) return 'Pacific/Honolulu'
    if (longitude >= -165 && longitude < -135) return 'America/Anchorage'
    if (longitude >= -135 && longitude < -120) return 'America/Los_Angeles'
    if (longitude >= -120 && longitude < -105) return 'America/Denver'
    if (longitude >= -105 && longitude < -90) return 'America/Chicago'
    if (longitude >= -90 && longitude < -75) return 'America/New_York'
    if (longitude >= -75 && longitude < -60) return 'America/Halifax'
    if (longitude >= -60 && longitude < -30) return 'America/Sao_Paulo'
    if (longitude >= -30 && longitude < 0) return 'Atlantic/Azores'
    if (longitude >= 0 && longitude < 15) return 'Europe/London'
    if (longitude >= 15 && longitude < 30) return 'Europe/Berlin'
    if (longitude >= 30 && longitude < 45) return 'Europe/Moscow'
    if (longitude >= 45 && longitude < 75) return 'Asia/Karachi'
    if (longitude >= 75 && longitude < 105) return 'Asia/Bangkok'
    if (longitude >= 105 && longitude < 135) return 'Asia/Shanghai'
    if (longitude >= 135 && longitude < 165) return 'Asia/Tokyo'
    if (longitude >= 165 && longitude <= 180) return 'Pacific/Auckland'
    
    return 'UTC'
  }

  // Handle search errors gracefully
  handleSearchError(error, query) {
    console.error('Places search failed:', error)
    
    // Return fallback results for common destinations
    if (query && query.length > 2) {
      return this.getFallbackResults(query)
    }
    
    return []
  }

  // Provide fallback results when API fails
  getFallbackResults(query) {
    const commonDestinations = [
      {
        id: 'fallback-paris',
        name: 'Paris',
        fullName: 'Paris, France',
        displayName: 'Paris, France',
        coordinates: { longitude: 2.3522, latitude: 48.8566 },
        location: { place: 'Paris', country: 'France', countryCode: 'FR' },
        type: 'city',
        relevance: 0.9,
        travelInfo: { isPopularDestination: true, destinationType: 'destination' }
      },
      {
        id: 'fallback-london',
        name: 'London',
        fullName: 'London, United Kingdom',
        displayName: 'London, United Kingdom',
        coordinates: { longitude: -0.1276, latitude: 51.5074 },
        location: { place: 'London', country: 'United Kingdom', countryCode: 'GB' },
        type: 'city',
        relevance: 0.9,
        travelInfo: { isPopularDestination: true, destinationType: 'destination' }
      },
      {
        id: 'fallback-tokyo',
        name: 'Tokyo',
        fullName: 'Tokyo, Japan',
        displayName: 'Tokyo, Japan',
        coordinates: { longitude: 139.6917, latitude: 35.6895 },
        location: { place: 'Tokyo', country: 'Japan', countryCode: 'JP' },
        type: 'city',
        relevance: 0.9,
        travelInfo: { isPopularDestination: true, destinationType: 'destination' }
      },
      {
        id: 'fallback-newyork',
        name: 'New York',
        fullName: 'New York, United States',
        displayName: 'New York, United States',
        coordinates: { longitude: -74.0060, latitude: 40.7128 },
        location: { place: 'New York', region: 'New York', country: 'United States', countryCode: 'US' },
        type: 'city',
        relevance: 0.9,
        travelInfo: { isPopularDestination: true, destinationType: 'destination' }
      }
    ]

    // Filter destinations that match the query
    const queryLower = query.toLowerCase()
    return commonDestinations.filter(dest => 
      dest.name.toLowerCase().includes(queryLower) ||
      dest.fullName.toLowerCase().includes(queryLower)
    )
  }

  // Utility function to check if API is configured
  isConfigured() {
    return this.accessToken && this.accessToken !== 'your-mapbox-token-here'
  }

  // Get popular destinations for a region/country
  async getPopularDestinations(countryCode, options = {}) {
    try {
      const { limit = 20 } = options
      
      const results = await this.searchPlaces('', {
        countries: countryCode.toLowerCase(),
        types: ['place'],
        limit
      })
      
      // Filter and sort by popularity
      return results
        .filter(place => place.travelInfo.isPopularDestination)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit)
        
    } catch (error) {
      console.error('Error getting popular destinations:', error)
      return []
    }
  }

  // Search specifically for travel destinations
  async searchDestinations(query, options = {}) {
    const searchOptions = {
      ...options,
      types: ['place', 'locality'], // Focus on cities and towns
      limit: options.limit || 8
    }
    
    const results = await this.searchPlaces(query, searchOptions)
    
    // Filter for travel-appropriate destinations
    return results.filter(place => 
      ['city', 'town', 'place'].includes(place.type) &&
      place.location.country // Must have country information
    )
  }
}

// Create and export places service instance
export const placesService = new PlacesService()

// Export individual functions for convenience
export const searchPlaces = (query, options) => placesService.searchPlaces(query, options)
export const searchDestinations = (query, options) => placesService.searchDestinations(query, options)
export const getPlaceDetails = (placeId) => placesService.getPlaceDetails(placeId)
export const reverseGeocode = (longitude, latitude, options) => placesService.reverseGeocode(longitude, latitude, options)
export const getPopularDestinations = (countryCode, options) => placesService.getPopularDestinations(countryCode, options)

// Export the service class for advanced usage
export { PlacesService }