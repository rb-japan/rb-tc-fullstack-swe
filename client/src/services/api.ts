import { Party } from '../types/types';

const API_BASE_URL = 'http://localhost:5000/api/waitlist';

export interface JoinResponse {
  party: Party;
  sessionId: string;
  message: string;
}

export const joinWaitlist = async (name: string, size: number): Promise<JoinResponse> => {
  const response = await fetch(`${API_BASE_URL}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, size }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to join waitlist');
  }

  return response.json();
};

export const checkIn = async (sessionId: string): Promise<JoinResponse> => {
  const response = await fetch(`${API_BASE_URL}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check in');
  }

  return response.json();
}

export const getStatus = async (sessionId: string): Promise<JoinResponse> => {
  const response = await fetch(`http://localhost:5000/api/waitlist/status/${sessionId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get status');
  }

  return response.json();
}