import { useState, useEffect, useCallback } from 'react';
import { getBuddyRequests } from '../firebase/platformDatabase';

export function useBuddyRequests(userId) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingCount = useCallback(async () => {
    if (!userId) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const requests = await getBuddyRequests(userId);
      
      // Count only pending incoming requests
      const pendingRequests = requests.received.filter(
        req => req.status === 'pending'
      );
      
      setPendingCount(pendingRequests.length);
    } catch (error) {
      console.error('Error fetching buddy requests:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPendingCount();
    
    // Refresh count every 30 seconds for real-time updates
    const interval = setInterval(fetchPendingCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  return { pendingCount, loading, refresh: fetchPendingCount };
}
