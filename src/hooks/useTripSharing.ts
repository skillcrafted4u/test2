import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TripDetails } from '../types';

interface ShareableTrip {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  isPublic: boolean;
  customUrl?: string;
}

interface SocialStats {
  loves: number;
  saves: number;
  views: number;
  shares: number;
}

export function useTripSharing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Make trip public/private
  const toggleTripVisibility = useCallback(async (tripId: string, isPublic: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('trips')
        .update({ 
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trip visibility';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update trip sharing details
  const updateTripDetails = useCallback(async (
    tripId: string, 
    updates: { title?: string; description?: string; coverImage?: string }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trip details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Love/unlike a trip
  const loveTrip = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to love trips');

      // Check if already loved
      const { data: existing } = await supabase
        .from('trip_loves')
        .select('id')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('trip_loves')
          .delete()
          .eq('trip_id', tripId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { success: true, action: 'unliked' };
      } else {
        // Love
        const { error } = await supabase
          .from('trip_loves')
          .insert({
            trip_id: tripId,
            user_id: user.id
          });

        if (error) throw error;
        return { success: true, action: 'loved' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to love trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Save/unsave a trip
  const saveTrip = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to save trips');

      // Check if already saved
      const { data: existing } = await supabase
        .from('saved_trips')
        .select('id')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Unsave
        const { error } = await supabase
          .from('saved_trips')
          .delete()
          .eq('trip_id', tripId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { success: true, action: 'unsaved' };
      } else {
        // Save
        const { error } = await supabase
          .from('saved_trips')
          .insert({
            trip_id: tripId,
            user_id: user.id
          });

        if (error) throw error;
        return { success: true, action: 'saved' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Follow/unfollow a creator
  const followCreator = useCallback(async (creatorId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to follow creators');

      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', creatorId)
        .single();

      if (existing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', creatorId);

        if (error) throw error;
        return { success: true, action: 'unfollowed' };
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: creatorId
          });

        if (error) throw error;
        return { success: true, action: 'followed' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to follow creator';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trip social stats
  const getTripStats = useCallback(async (tripId: string): Promise<SocialStats | null> => {
    try {
      const [lovesResult, savesResult, viewsResult] = await Promise.all([
        supabase.from('trip_loves').select('id', { count: 'exact' }).eq('trip_id', tripId),
        supabase.from('saved_trips').select('id', { count: 'exact' }).eq('trip_id', tripId),
        supabase.from('trip_views').select('id', { count: 'exact' }).eq('trip_id', tripId)
      ]);

      return {
        loves: lovesResult.count || 0,
        saves: savesResult.count || 0,
        views: viewsResult.count || 0,
        shares: 0 // Would track shares separately
      };
    } catch (err) {
      console.error('Error getting trip stats:', err);
      return null;
    }
  }, []);

  // Record trip view
  const recordTripView = useCallback(async (tripId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Record view (anonymous or authenticated)
      const { error } = await supabase
        .from('trip_views')
        .insert({
          trip_id: tripId,
          user_id: user?.id || null,
          viewed_at: new Date().toISOString()
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Error recording trip view:', error);
      }
    } catch (err) {
      console.error('Error recording trip view:', err);
    }
  }, []);

  // Generate QR code for trip sharing
  const generateQRCode = useCallback(async (tripId: string) => {
    const tripUrl = `${window.location.origin}/trip/${tripId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tripUrl)}`;
    return qrCodeUrl;
  }, []);

  // Share trip to social media
  const shareTrip = useCallback(async (tripId: string, platform: string, tripDetails: any) => {
    const tripUrl = `${window.location.origin}/trip/${tripId}`;
    const text = `Check out this amazing ${tripDetails.selectedMood?.name} trip to ${tripDetails.destination}! ✈️`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(tripUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tripUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${tripUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(`Amazing Trip to ${tripDetails.destination}`)}&body=${encodeURIComponent(`${text}\n\n${tripUrl}`)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      
      // Record share event
      try {
        await supabase
          .from('trip_shares')
          .insert({
            trip_id: tripId,
            platform,
            shared_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Error recording share:', err);
      }
    }
  }, []);

  // Copy trip as template
  const copyTripTemplate = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to copy trips');

      // Get original trip
      const { data: originalTrip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (tripError) throw tripError;

      // Create copy
      const { data: newTrip, error: copyError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: originalTrip.destination,
          start_date: originalTrip.start_date,
          end_date: originalTrip.end_date,
          budget: originalTrip.budget,
          traveler_count: originalTrip.traveler_count,
          selected_moods: originalTrip.selected_moods,
          is_public: false, // Copies are private by default
          is_template_copy: true,
          original_trip_id: tripId
        })
        .select()
        .single();

      if (copyError) throw copyError;

      // Copy activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('trip_id', tripId);

      if (activitiesError) throw activitiesError;

      if (activities && activities.length > 0) {
        const newActivities = activities.map(activity => ({
          trip_id: newTrip.id,
          day_number: activity.day_number,
          title: activity.title,
          description: activity.description,
          location: activity.location,
          cost: activity.cost,
          duration: activity.duration,
          category: activity.category,
          image_url: activity.image_url,
          order_index: activity.order_index
        }));

        const { error: insertError } = await supabase
          .from('activities')
          .insert(newActivities);

        if (insertError) throw insertError;
      }

      return { success: true, newTripId: newTrip.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy trip';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    toggleTripVisibility,
    updateTripDetails,
    loveTrip,
    saveTrip,
    followCreator,
    getTripStats,
    recordTripView,
    generateQRCode,
    shareTrip,
    copyTripTemplate
  };
}