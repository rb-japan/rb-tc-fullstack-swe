import { useState, useEffect } from 'react';
import { Party } from '../types/types';
import { socket } from '../socket/socket';

export const usePartyStatus = (sessionId: string | null, initialParty: Party | null) => {
  const [party, setParty] = useState<Party | null>(initialParty ?? null);

  useEffect(() => {
    if (initialParty) {
      setParty(initialParty);
    }
  }, [initialParty]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!sessionId) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/waitlist/status/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setParty(data.party);
        }
      } catch (error) {
        console.error('Failed to fetch party status:', error);
      }
    };

    if (sessionId && !initialParty) {
      fetchStatus();
    }
  }, [sessionId, initialParty]);

  useEffect(() => {
    if (!sessionId) return;

    socket.emit('joinParty', sessionId);

    const handleStatusUpdate = (data: { party: Party }) => {
      setParty(data.party);
    };

    socket.on('statusUpdate', handleStatusUpdate);
    
    return () => {
      socket.off('statusUpdate');
    };
  }, [sessionId]);

  return party;
};
