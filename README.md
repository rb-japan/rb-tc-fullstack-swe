### Description
This is a finished assignment for https://github.com/TableCheck-Labs/fullstack-swe-takehome.
It includes a working solution for dev environment that requires Docker to run and some tests for better maintainability.

### Tech Stack
Frontend: TypeScript, React, Emotion CSS.

Backend: TypeScript, Express.js, MongoDB, socket.io.

Unit tests are written with Jest.

### Setting Up
After cloning this repo, you need to do the following.
First, set up the client side:
```
cd client
npm install
npm run dev
```
Visit https://localhost:3000.

Next, set up the server side (run the app only after Mongo service is up in Docker):
```
cd server
npm install
docker compose up -d
npm run dev
```

### Architecture Explanation
On the frontend, I chose a React SPA architecture with TS for type safety and better development experience. 
The frontend uses a combination of local storage for session persistence and WebSocket connections for real-time updates. 
This ensures that users can track their status even if they close and reopen their browser. 
I implemented a custom hook (usePartyStatus) to encapsulate the WebSocket logic and state management, making the components cleaner. 
The UI components are built with Emotion CSS for styling as it provides an easy way to build custom components and is preferred by **TableCheck** team.

The backend uses Express.js with MongoDB to handle the core business logic, including queue management, seat availability tracking, and real-time status updates. 
The decision to use MongoDB was driven by its flexibility with data structures and easy integration with Node.js. 
The backend implements stateless REST endpoints for initial interactions, but uses Socket.io for real-time updates.

A key architectural decision was the implementation of the automatic timeout system for ready parties. 
If a party doesn't check in within 15 seconds, they are automatically removed from the system and the next party is processed. 
The system also maintains strict queue ordering and seat availability tracking, ensuring that parties are served in the correct order.
While this implementation is pretty basic, it allows us to run the restaurant in a correct and timely manner.

### Additional Considerarions
What can be improved to make the app more production-ready?
1. Backend unit tests.
2. Adding E2E tests.
3. The automatic timeout system should have a real-time countdown so that customers would see how much time is left for them to take a table.
4. UX-friendly error handling instead of console logging.
5. Add a cron job that would remove all parties with the **completed** status from the database once in a while. **NOTE:** it's possible to remove a party after it's served but party information might be necessary for analytics/marketing purposes later, so we still keep it.
