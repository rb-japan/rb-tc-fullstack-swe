import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { JoinForm } from './components/JoinForm';

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
  const handleJoin = async (name: string, size: number) => {
    try {
      console.log(`name is ${name} and size is ${size}`);
    } catch (error) {
      console.error('Failed to join waitlist:', error);
    }
  };

  return (
    <Container>
      <MainContent>
        <Title>Restaurant Waitlist</Title>
        <JoinForm onSubmit={handleJoin} />
      </MainContent>
    </Container>
  );
}

export default App