import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { JoinForm } from '../JoinForm';

describe('JoinForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders all form elements', () => {
    render(<JoinForm onSubmit={mockSubmit} sessionId={null} />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Number of customers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument();
  });

  it('button is disabled when form is empty', () => {
    render(<JoinForm onSubmit={mockSubmit} sessionId={null} />);
    
    const button = screen.getByRole('button', { name: /join waitlist/i });
    expect(button).toBeDisabled();
  });

  it('button is disabled when sessionId exists', () => {
    render(<JoinForm onSubmit={mockSubmit} sessionId="some-session-id" />);
    
    const button = screen.getByRole('button', { name: /join waitlist/i });
    expect(button).toBeDisabled();
  });

  it('enables button when form is filled', async () => {
    render(<JoinForm onSubmit={mockSubmit} sessionId={null} />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const sizeInput = screen.getByPlaceholderText('Number of customers');
    const button = screen.getByRole('button', { name: /join waitlist/i });
    expect(button).toBeDisabled();

    await userEvent.type(nameInput, 'John');
    await userEvent.type(sizeInput, '4');

    await waitFor(() => {
        expect(button).toBeEnabled();
      });
  });

  it('submits form with correct values', async () => {
    render(<JoinForm onSubmit={mockSubmit} sessionId={null} />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const sizeInput = screen.getByPlaceholderText('Number of customers');
    const button = screen.getByRole('button', { name: /join waitlist/i });

    await userEvent.type(nameInput, 'John');
    await userEvent.type(sizeInput, '4');
    userEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('John', 4);
    });
  });
});
