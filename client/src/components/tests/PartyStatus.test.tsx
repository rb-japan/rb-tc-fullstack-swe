import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyStatus } from '../PartyStatus';

const mockParty = {
 _id: '1',
 name: 'John',
 size: 5,
 status: 'waiting' as const,
 sessionId: 'abcdef',
 createdAt: new Date()
};

describe('PartyStatus', () => {
 const mockCheckIn = jest.fn();
 const mockComplete = jest.fn();

 beforeEach(() => {
   jest.clearAllMocks();
 });

 it('displays party info correctly', () => {
   render(<PartyStatus party={mockParty} onCheckIn={mockCheckIn} onComplete={mockComplete} />);

   expect(screen.getByText(/party of john with 5 people/i)).toBeInTheDocument();
 });

 it('shows correct status message for waiting state', () => {
   render(<PartyStatus party={mockParty} onCheckIn={mockCheckIn} onComplete={mockComplete} />);

   expect(screen.getByText('Waiting for your turn...')).toBeInTheDocument();
 });

 it('shows check-in button only when ready', () => {
   const readyParty = { ...mockParty, status: 'ready' as const };
   render(<PartyStatus party={readyParty} onCheckIn={mockCheckIn} onComplete={mockComplete} />);
   
   const button = screen.getByRole('button', { name: /check in/i });
   expect(button).toBeInTheDocument();
 });

 it('handles check-in click', async () => {
   const readyParty = { ...mockParty, status: 'ready' as const };   
   render(<PartyStatus party={readyParty} onCheckIn={mockCheckIn} onComplete={mockComplete} />);
   
   await userEvent.click(screen.getByRole('button', { name: /check in/i }));
   expect(mockCheckIn).toHaveBeenCalled();
 });

 it('calls onComplete when status changes to completed', () => {
   const completedParty = { ...mockParty, status: 'completed' as const };
   render(<PartyStatus party={completedParty} onCheckIn={mockCheckIn} onComplete={mockComplete} />);
   
   expect(mockComplete).toHaveBeenCalled();
   expect(localStorage.getItem('sessionId')).toBeNull();
 });

 it('uses custom message when provided', () => {
   const partyWithMessage = { ...mockParty, message: 'Custom status message' };
   render(<PartyStatus party={partyWithMessage} onCheckIn={mockCheckIn} onComplete={mockComplete} />);
   
   expect(screen.getByText('Custom status message')).toBeInTheDocument();
 });
});
