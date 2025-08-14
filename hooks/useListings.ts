import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/lib/types';

export function useListings(userId?: string) {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      setData((data || []) as Listing[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  return { data, loading, error, refetch: fetchListings };
}
