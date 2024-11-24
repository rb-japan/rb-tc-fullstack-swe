import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Party } from '../types/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  width: 100%;
  max-width: 400px;
  gap: 10px;
`;

const StatusText = styled.p<{ status: Party['status'] }>`
  color: ${props => {
    switch (props.status) {
      case 'ready': return '#7c3aed';
      case 'in_service': return '#4c1d95';
      case 'completed': return '#a78bfa';
      default: return '#6d28d9';
    }
  }};
  font-weight: 500;
`;

const CheckInButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #6d28d9;
  }
`;

interface Props {
  party: Party;
  onCheckIn: () => Promise<void>;
  onComplete: () => void;
}

export const PartyStatus: React.FC<Props> = ({ party, onCheckIn, onComplete }) => {
  const getStatusMessage = () => {
    switch (party.status) {
      case 'waiting': return 'Waiting for your turn...';
      case 'ready': return 'Your table is ready!';
      case 'in_service': return 'Enjoy your meal!';
      case 'completed': return 'Thank you for dining with us!';
    }
  };

  useEffect(() => {
    if (party.status === 'completed') {
      localStorage.removeItem('sessionId');
      onComplete();
    }
  }, [party.status, onComplete]);

  return (
    <Container>
      <h3>Party of {party.name} with {party.size} people</h3>
      <StatusText status={party.status}>{getStatusMessage()}</StatusText>
      {party.status === 'ready' && (
        <CheckInButton onClick={onCheckIn}>Check In</CheckInButton>
      )}
    </Container>
  );
};
