# GlobeTrotter — Travel Planner

GlobeTrotter is a full-stack travel planning app that lets users search destinations, build trip itineraries (with AI assistance), track trip budgets, and manage their profile — all backed by a Node/Express API and a PostgreSQL database.

## Features

- **Authentication** — signup/login with JWT, protected routes
- **Profile management** — view and update account details
- **City search** — browse and filter destinations by region, cost, and tags
- **Trip creation** — create trips and attach cities
- **AI itinerary planner** — generate a day-by-day itinerary via Google Gemini based on budget, interests, pace, and dates
- **Itinerary builder** — view and edit generated stops and activities
- **Trip budget tracking** — see estimated costs broken down by category
- **My Trips dashboard** — view all trips created by the current user

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router 7
- Tailwind CSS 4
- Axios

**Backend**
- Node.js + Express 5
- PostgreSQL (`pg`)
- JWT authentication (`jsonwebtoken`, `bcrypt`)
- Google Gemini API (`@google/generative-ai`) for AI itinerary generation

## Project Structure

```
globetrotter-travel-planner-Login_homescreen/
├── src/                        # Frontend source
│   ├── pages/                  # Route-level pages (Dashboard, CreateTrip, Profile, etc.)
│   ├── components/             # Shared UI components (Navbar, ProtectedRoute, etc.)
│   ├── context/                # React context (AuthContext)
│   ├── routes/                 # AppRoutes.jsx — central route map
│   ├── lib/ & api.js           # API client helpers
│   └── main.jsx / App.jsx      # App entry point
├── public/                     # Static assets
├── backend122/backend/         # Backend API
│   ├── config/                 # DB connection (db.js) and schema init (initDb.js)
│   ├── controllers/            # Route handlers (auth, trip, city, itinerary)
│   ├── routes/                 # Express route definitions
│   ├── middleware/              # Auth middleware, error handler
│   ├── services/                # AI itinerary generation service
│   ├── validators/              # Request validation
│   └── index.js                 # Backend entry point
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- PostgreSQL database (local or hosted)
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone and install frontend dependencies

```bash
git clone https://github.com/moinakgh99/globetrotter-travel-planner.git
cd globetrotter-travel-planner
npm install
```

### 2. Install backend dependencies

```bash
cd backend122/backend
npm install
```

### 3. Configure environment variables

**Frontend** — create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000
```

**Backend** — create a `.env` file in `backend122/backend/`:

```
PORT=5000
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> Neither `.env` file should ever be committed — both are already covered by `.gitignore`.

### 4. Run the backend

```bash
cd backend122/backend
node index.js
```

On first boot, the server checks and initializes the database schema (users, cities, trips, and related tables) and seeds a starter set of cities.

### 5. Run the frontend

From the project root, in a separate terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or `5175`, depending on your Vite config).

## Available Scripts

**Frontend** (run from project root)
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

**Backend** (run from `backend122/backend/`)
| Command | Description |
|---|---|
| `node index.js` | Start the API server |

## Routes Overview

| Path | Description |
|---|---|
| `/` | Dashboard (protected) |
| `/login` | Login / Signup |
| `/trips/create` | Create a new trip |
| `/trips` | My Trips list |
| `/trips/:id/plan` | AI itinerary planner wizard |
| `/trips/:id/itinerary` | Itinerary builder |
| `/trips/:id/view` | Read-only itinerary view |
| `/trips/:id/budget` | Trip budget breakdown |
| `/cities` | City search |
| `/profile` | User profile |

## Contributing

This project was built collaboratively; contributions are merged into feature branches and reviewed via pull request before being merged into `main`. Please avoid pushing directly to `main`.

## License

Add your license here.
