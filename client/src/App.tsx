import React, { useState } from 'react';
import styled from '@emotion/styled';
import { JoinForm } from './components/JoinForm';
import { PartyStatus } from './components/PartyStatus';
import { usePartyStatus } from './hooks/usePartyStatus';
import { joinWaitlist, checkIn } from './services/api';
import { Party } from './types/types';

import './index.css';

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f3f4f6;
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Title = styled.h1`
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
`;

function App() {
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('sessionId')
  );
  const [initialParty, setInitialParty] = useState<Party | null>(null);  
  const party = usePartyStatus(sessionId, initialParty);

  const handleJoin = async (name: string, size: number) => {
    try {      
      const response = await joinWaitlist(name, size);
      localStorage.setItem('sessionId', response.sessionId);
      setSessionId(response.sessionId);
      setInitialParty(response.party);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    }
  };

  const handleCheckIn = async () => {
    if (!sessionId) return;
    try {
      await checkIn(sessionId);
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleComplete = () => {
    setSessionId(null);
  };

  return (
    <Container>
      <MainContent>
        <Title>Restaurant Waitlist</Title>
        {party ? (
        <PartyStatus party={party} onCheckIn={handleCheckIn} onComplete={handleComplete} />
      ) : (
        <JoinForm onSubmit={handleJoin} sessionId={sessionId} />
      )}
      </MainContent>
    </Container>
  );
}

export default App
