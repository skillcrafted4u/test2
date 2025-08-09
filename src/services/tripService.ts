import { supabase } from '../lib/supabase'
import { TripDetails, DayItinerary, ItineraryItem } from '../types'
import type { Database } from '../lib/supabase'

type Trip = Database['public']['Tables']['trips']['Row']
type TripInsert = Database['public']['Tables']['trips']['Insert']
type Activity = Database['public']['Tables']['activities']['Row']
type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export class TripService {
  // Generate a session ID for guest users
  private getSessionId(): string {
    let sessionId = localStorage.getItem('wanderlust_session_id')
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('wanderlust_session_id', sessionId)
    }
    return sessionId
  }

  // Save trip to database
  async saveTrip(tripDetails: TripDetails): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const tripData: TripInsert = {
        user_id: user?.id || null,
        session_id: user ? null : this.getSessionId(),
        destination: tripDetails.destination,
        start_date: tripDetails.startDate,
        end_date: tripDetails.endDate,
        budget: tripDetails.budget,
        traveler_count: tripDetails.travelers,
        selected_moods: tripDetails.selectedMood ? {
          id: tripDetails.selectedMood.id,
          name: tripDetails.selectedMood.name,
          emoji: tripDetails.selectedMood.emoji
        } : null
      }

      const { data, error } = await supabase
        .from('trips')
        .insert(tripData)
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error saving trip:', error)
      throw new Error('Failed to save trip')
    }
  }

  // Save itinerary activities
  async saveItinerary(tripId: string, itinerary: DayItinerary[]): Promise<void> {
    try {
      const activities: ActivityInsert[] = []

      itinerary.forEach((day) => {
        day.items.forEach((item, index) => {
          activities.push({
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
          })
        })
      })

      const { error } = await supabase
        .from('activities')
        .insert(activities)

      if (error) throw error
    } catch (error) {
      console.error('Error saving itinerary:', error)
      throw new Error('Failed to save itinerary')
    }
  }

  // Load trip by ID
  async loadTrip(tripId: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error loading trip:', error)
      return null
    }
  }

  // Load itinerary for a trip
  async loadItinerary(tripId: string): Promise<DayItinerary[]> {
    try {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) throw error

      // Group activities by day
      const dayMap = new Map<number, Activity[]>()
      activities.forEach(activity => {
        if (!dayMap.has(activity.day_number)) {
          dayMap.set(activity.day_number, [])
        }
        dayMap.get(activity.day_number)!.push(activity)
      })

      // Convert to DayItinerary format
      const itinerary: DayItinerary[] = []
      dayMap.forEach((dayActivities, dayNumber) => {
        const items: ItineraryItem[] = dayActivities.map(activity => ({
          id: activity.id,
          time: '09:00', // Default time - could be enhanced
          title: activity.title,
          description: activity.description || '',
          location: activity.location || '',
          type: (activity.category as any) || 'activity',
          duration: activity.duration || '2 hours',
          cost: activity.cost || undefined,
          rating: 4.0 + Math.random() * 1.0, // Mock rating
          image: activity.image_url || undefined,
          isEditable: true
        }))

        itinerary.push({
          day: dayNumber,
          date: new Date().toDateString(), // Would calculate from trip dates
          items,
          weather: {
            condition: 'sunny',
            temperature: 22,
            icon: '☀️'
          },
          isCollapsed: false
        })
      })

      return itinerary
    } catch (error) {
      console.error('Error loading itinerary:', error)
      return []
    }
  }

  // Get user's trips
  async getUserTrips(): Promise<Trip[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('session_id', this.getSessionId())
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error loading user trips:', error)
      return []
    }
  }

  // Update activity order after drag and drop
  async updateActivityOrder(tripId: string, dayNumber: number, activities: ItineraryItem[]): Promise<void> {
    try {
      const updates = activities.map((activity, index) => ({
        id: activity.id,
        order_index: index
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('activities')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('trip_id', tripId)
          .eq('day_number', dayNumber)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating activity order:', error)
      throw new Error('Failed to update activity order')
    }
  }

  // Delete activity
  async deleteActivity(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw new Error('Failed to delete activity')
    }
  }

  // Add impact contribution
  async addImpactContribution(tripId: string, amount: number): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('impact_contributions')
        .insert({
          trip_id: tripId,
          contribution_amount: amount
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error adding impact contribution:', error)
      return { data: null, error: 'Failed to add impact contribution' }
    }
  }

  // Load existing trip by session
  async loadTripBySession(sessionId: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error loading trip by session:', error)
      return null
    }
  }
}

export const tripService = new TripService()