import { useState } from 'react'
import { tripService } from '../services/tripService'
import { v4 as uuidv4 } from 'uuid';

// Hook for social impact tracking
export const useImpact = () => {
  const [totalImpact, setTotalImpact] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recordImpact = async (tripId: string, budget: number) => {
    setLoading(true)
    setError(null)
    
    try {
      // Generate a valid UUID if tripId is not a valid UUID
      const validTripId = tripId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) ?
          tripId : uuidv4();
      
      const { data, error } = await tripService.addImpactContribution(tripId, budget)
      
      if (error) throw new Error(error)
      
      if (data) {
        setTotalImpact(prev => prev + data.contribution_amount)
      }
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Impact tracking error'
      setError(errorMessage)
      console.error('Impact tracking error:', err)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }
  
  return { 
    totalImpact, 
    loading, 
    error, 
    recordImpact 
  }
}