import { useState, useEffect } from 'react'
import { tripService } from '../services/tripService'
import { TripDetails, DayItinerary } from '../types'
import type { Database } from '../lib/supabase'

type Trip = Database['public']['Tables']['trips']['Row']

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get session ID from localStorage or create new one
  const getSessionId = () => {
    let sessionId = localStorage.getItem('travel_session_id')
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('travel_session_id', sessionId)
    }
    return sessionId
  }

  const loadTrips = async () => {
    setLoading(true)
    setError(null)
    try {
      const userTrips = await tripService.getUserTrips()
      setTrips(userTrips)
    } catch (err) {
      setError('Failed to load trips')
      console.error('Error loading trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveTrip = async (tripDetails: TripDetails): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getSessionId()
      const tripId = await tripService.saveTrip({
        ...tripDetails,
        sessionId
      })
      
      await loadTrips() // Refresh trips list
      return tripId
    } catch (err) {
      setError('Failed to save trip')
      console.error('Error saving trip:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const saveItinerary = async (tripId: string, itinerary: DayItinerary[]): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const activities = itinerary.flatMap((day) =>
        day.items.map((item, index) => ({
          trip_id: tripId,
          day_number: day.day,
          title: item.title,
          description: item.description,
          location: item.location,
          cost: item.cost || null,
          duration: item.duration,
          category: item.type,
          image_url: item.image || null,
          order_index: index
        }))
      )
      
      await tripService.saveItinerary(tripId, itinerary)
      
      return true
    } catch (err) {
      setError('Failed to save itinerary')
      console.error('Error saving itinerary:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const loadTrip = async (tripId: string): Promise<Trip | null> => {
    setLoading(true)
    setError(null)
    try {
      const trip = await tripService.loadTrip(tripId)
      return trip
    } catch (err) {
      setError('Failed to load trip')
      console.error('Error loading trip:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadItinerary = async (tripId: string): Promise<DayItinerary[]> => {
    setLoading(true)
    setError(null)
    try {
      const itinerary = await tripService.loadItinerary(tripId)
      return itinerary
    } catch (err) {
      setError('Failed to load itinerary')
      console.error('Error loading itinerary:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const deleteActivity = async (activityId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await tripService.deleteActivity(activityId)
      return true
    } catch (err) {
      setError('Failed to delete activity')
      console.error('Error deleting activity:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateActivityOrder = async (
    tripId: string, 
    dayNumber: number, 
    activities: any[]
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await tripService.updateActivityOrder(tripId, dayNumber, activities)
      return true
    } catch (err) {
      setError('Failed to update activity order')
      console.error('Error updating activity order:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Load existing trip by session
  const loadTripBySession = async () => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getSessionId()
      return await tripService.loadTripBySession(sessionId)
    } catch (err) {
      setError('Failed to load trip')
      console.error('Error loading trip:', err)
      return null
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadTrips()
  }, [])

  return {
    trips,
    loading,
    error,
    loadTrips,
    saveTrip,
    saveItinerary,
    loadTrip,
    loadItinerary,
    deleteActivity,
    updateActivityOrder,
    loadTripBySession,
    getSessionId
  }
}