import React, { useState } from 'react';
import styled from '@emotion/styled';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 2px solid #e9d5ff;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #a855f7;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #7c3aed;
  }

  &:active {
    background: #6d28d9;
  }
`;

interface Props {
  onSubmit: (name: string, size: number) => Promise<void>;
  sessionId: string | null;
}

export const JoinForm: React.FC<Props> = ({ onSubmit, sessionId }) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && size) {
        await onSubmit(name, parseInt(size));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <Input
        type="number"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        placeholder="Number of customers"
        min={1}
        max={10}
        required
      />
      <Button disabled={!!sessionId} type="submit">Join Waitlist</Button>
    </Form>
  );
};
