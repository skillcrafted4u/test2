export interface Mood {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gradient: string;
}

export interface TripDetails {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travelers: number;
  selectedMood?: Mood;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  type: 'attraction' | 'restaurant' | 'activity' | 'transport';
  duration: string;
  cost?: number;
  rating?: number;
  image?: string;
  weather?: string;
  isEditable?: boolean;
}

export interface DayItinerary {
  day: number;
  date: string;
  items: ItineraryItem[];
  weather?: {
    condition: string;
    temperature: number;
    icon: string;
  };
  isCollapsed?: boolean;
}

export interface Destination {
  name: string;
  country: string;
  region: string;
}