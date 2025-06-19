import { useState, useCallback } from 'react';

export const useCommunications = () => {
  const [communications, setCommunications] = useState([]);

  const addCommunication = useCallback((newComm) => {
    setCommunications(prev => [...prev, newComm]);
  }, []);

  const resetCommunications = useCallback(() => {
    setCommunications([]);
  }, []);

  return {
    communications,
    addCommunication,
    resetCommunications
  };
}; 