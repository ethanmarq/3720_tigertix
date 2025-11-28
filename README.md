#### TigerTix - Campus Event Booking System
##### Project Overview
TigerTix is a microservices-based event booking platform designed for university campus events. It features a unified web interface where users can view events, register/login, and book tickets either through standard UI controls or via an AI-powered conversational assistant.

The system is architected as a Unified Gateway backend that routes traffic to four distinct microservices: Admin Service (Event Management), Client Service (Event booking), Auth Service (User registration), LLM Service (AI Chatbot for booking).

Tech Stack: 
- Frontend: React.js, CSS Modules
- Backend: Node.js, Express.js (Gateway & Microservices)
- Database: SQLite (Shared file-based database)
- AI/LLM: Ollama (Llama 3.1) or Mock Fallback for deployment
- Testing: Jest (Backend Unit), Playwright (Frontend E2E)
- DevOps: GitHub Actions (CI/CD Pipeline)


##### Architecture Summary
The system uses a Unified Gateway pattern. A single Express server (backend/server.js) runs on port 10000 and routes requests to specific internal microservices based on the URL path. `/auth/*` is User Authenticaiton Services, `/api/admin/*` is Admin Service, `/api/events` is Client Service, `/api/llm/*/` is LLM Service. The Frontend runs on Port 3000. All services share a single database.sqlite file location in `backend/shared-db` to ensure data consistency across the distributed services.

##### Installation and Setup Instructions
Required: Node.js (v18 or higher), npm (Node Package Manager), Git

1. Clone the repo
```bash
git clone https://github.com/ethanmarq/3720_tigertix.git
cd 3720_tigertix
```

2. Backend Setup
The backend uses native modules (sqlite3) which must be compiled for your specific machine architecture (Apple Silicon vs Intel vs Windows).
```bash
cd backend
npm install
npm run install-all
```

If you encounter `ERR_DLOPEN_FAILED` or wrong architecture errors when starting the server, you must clean and rebuild the dependencies for your specific chip. Run this command from the backend/ folder:
```bash
rm -rf node_modules package-lock.json
npm install

cd admin-service && rm -rf node_modules package-lock.json && npm install && cd ..
cd client-service && rm -rf node_modules package-lock.json && npm install && cd ..
cd user-authentication && rm -rf node_modules package-lock.json && npm install && cd ..
cd llm-service && rm -rf node_modules package-lock.json && npm install && cd ..
```

3. Database Initialization
Before running the app, initialize the shared database
```bash
node backend/shared-db/setup/js
```

4. Frontend Setup
```bash
cd Frontend
npm install
```

##### Environment Variables Setup
Frontend (frontend/.env)
Create a file named .env inside the frontend directory:
```text
REACT_APP_API_URL=http://localhost:10000
```

Backend
No specific .env file is requried for local deployment, but you can configure ports if needed in `backend/server.js`

##### Running the Applicaiton
1. Start the Unified Backend
```bash
cd backend
nmp start
```

2. Start the Frontend
```bash
cd frontend
npm start
```

##### Adding events
```bash
curl -X POST http://localhost:10000/api/admin/events \
-H "Content-Type: application/json" \
-d '{"name": "TigerTix Launch Party", "date": "2025-10-20", "tickets": 150}'
```

##### How to run regression tests 
Backend Unit Tests (Jest)
```bash
# Run all backend tests
cd backend/admin-service && npm test
cd ../user-authentication && npm test
```

Frontend E2E Tests (Playwright)
```bash
# Run from project root
npx playwright test
```

##### Team 
- Ethan Marquez 
- Michael Ellis 

Instructor: Dr. Brinkley

##### License
Distributed under the MIT License. See LICENSE for more information.

MIT License Summary: You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, provided that the original copyright notice and permission notice are included in all copies.
