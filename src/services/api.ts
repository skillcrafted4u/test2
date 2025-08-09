import { TripDetails, DayItinerary, APIError } from '../types';

// Mock API service for AI integration
class TravelAPIService {
  private baseUrl = 'https://api.wanderlust.ai/v1'; // Mock API endpoint
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'mock-api-key';

  async generateItinerary(tripDetails: TripDetails): Promise<DayItinerary[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock API call structure (ready for real OpenAI integration)
      const response = await this.mockAPICall('/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          destination: tripDetails.destination,
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          budget: tripDetails.budget,
          currency: tripDetails.currency,
          travelers: tripDetails.travelers,
          mood: tripDetails.selectedMood?.id,
          preferences: {
            moodDescription: tripDetails.selectedMood?.description,
            moodEmoji: tripDetails.selectedMood?.emoji
          }
        })
      });

      if (!response.ok) {
        throw new APIError({
          message: 'Failed to generate itinerary',
          code: response.status.toString(),
          retryable: response.status >= 500
        });
      }

      const data = await response.json();
      return data.itinerary;
    } catch (error) {
      console.error('API Error:', error);
      throw this.handleAPIError(error);
    }
  }

  async getSurpriseActivity(destination: string, mood: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await this.mockAPICall('/surprise-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          destination,
          mood
        })
      });

      if (!response.ok) {
        throw new APIError({
          message: 'Failed to get surprise activity',
          code: response.status.toString(),
          retryable: true
        });
      }

      return await response.json();
    } catch (error) {
      console.error('Surprise Activity API Error:', error);
      throw this.handleAPIError(error);
    }
  }

  private async mockAPICall(endpoint: string, options: RequestInit): Promise<Response> {
    // Mock successful response for demo
    const mockSuccess = Math.random() > 0.1; // 90% success rate
    
    if (mockSuccess) {
      return new Response(JSON.stringify({
        success: true,
        itinerary: [], // Would contain real itinerary data
        activity: {
          title: 'Surprise Local Experience',
          description: 'A hidden gem discovered by our AI',
          type: 'activity'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        error: 'Service temporarily unavailable'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private handleAPIError(error: any): APIError {
    if (error instanceof APIError) {
      return error;
    }

    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return new APIError({
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        retryable: true
      });
    }

    if (error.status === 429) {
      return new APIError({
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
        retryable: true
      });
    }

    if (error.status >= 500) {
      return new APIError({
        message: 'Our servers are experiencing issues. Please try again in a few minutes.',
        code: 'SERVER_ERROR',
        retryable: true
      });
    }

    return new APIError({
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN_ERROR',
      retryable: true
    });
  }
}

// Custom error class for API errors
class APIError extends Error {
  code?: string;
  retryable?: boolean;

  constructor({ message, code, retryable }: { message: string; code?: string; retryable?: boolean }) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.retryable = retryable;
  }
}

export const travelAPI = new TravelAPIService();
export { APIError };