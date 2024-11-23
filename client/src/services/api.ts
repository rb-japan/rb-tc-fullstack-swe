const API_BASE_URL = 'http://localhost:5000/api/waitlist';

export interface JoinResponse {
  party: {
    name: string;
    size: number;
    status: 'waiting' | 'ready' | 'in_service' | 'completed';
    sessionId: string;
    createdAt: Date;
  };
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
