export default {
  Base: '/api',
  Restaurant: {
    Base: '/waitlist',
    Join: '/join',
    CheckIn: '/checkin',
    Status: '/status/:sessionId',
  },
} as const;
