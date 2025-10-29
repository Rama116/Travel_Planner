# Travel Planner (MERN)

A full-stack travel planner with authentication, trip creation, destination autocomplete (Google Places), itinerary drag-and-drop, and budget charts.

## Stack
- Backend: Express, MongoDB/Mongoose, JWT, Jest/Supertest
- Frontend: React + Vite + Tailwind v4, Redux Toolkit, React Router, Pangea DnD, Chart.js

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Google Places API Key (for autocomplete)

### Backend
1. Copy env and set values:
   - Copy `backend/env.example` to `backend/.env` and fill values
2. Install and seed:
```bash
cd backend
npm i
npm run seed
npm run dev
```
API runs at `http://localhost:5000`.

### Frontend
1. Create `.env` in `frontend` (optional):
```bash
VITE_API_URL=http://localhost:5000/api
```
2. Install and run:
```bash
cd frontend
npm i
npm run dev
```
App runs at `http://localhost:5173`.

### Demo Credentials (from seed)
- Email: `demo@example.com`
- Password: `password123`

## Scripts
- Backend: `dev`, `start`, `seed`, `test`
- Frontend: `dev`, `build`, `preview`

## Structure
```
backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    seed/
    utils/
    server.js
  tests/
frontend/
  src/
    components/
    pages/
    store/
    utils/
```

## Notes
- Autocomplete proxied via backend `/api/places/autocomplete?q=...` to keep API key server-side.
- Drag-and-drop itinerary uses `@hello-pangea/dnd` and persists order.
- Budget uses `react-chartjs-2`.
