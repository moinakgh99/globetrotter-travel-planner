<div align="center">

# 🌍✈️ Globetrotter

### *AI-Powered Travel Planning, Reimagined*

Plan smarter trips in minutes — not hours. Globetrotter turns your rough travel idea into a full day-by-day itinerary, budget breakdown, and shareable trip plan using the power of AI.

<br/>

[![Live Website](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-2ea44f?style=for-the-badge)](https://globetrotter-nyxo.onrender.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI_Powered-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

[![License](https://img.shields.io/badge/License-None-lightgrey?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=flat-square)]()

<br/>

**[🚀 Live Website](https://globetrotter-nyxo.onrender.com/)** &nbsp;•&nbsp; **[✨ Features](#-features)** &nbsp;•&nbsp; **[🧱 Tech Stack](#-tech-stack)** &nbsp;•&nbsp; **[⚙️ Setup](#️-getting-started)** &nbsp;•&nbsp; **[📁 Structure](#-project-structure)**

</div>

<br/>

## 🪄 About

**Globetrotter** is a full-stack travel planning platform that combines a clean, modern React interface with an AI itinerary engine powered by **Google Gemini**. Give it a destination, dates, and a vibe — Globetrotter generates a structured itinerary, lets you fine-tune every stop, tracks your budget, and keeps everything synced to your account.

Built for a hackathon-grade rapid build, shipped as a production-ready, deployable web app. 🚀

<br/>

## ✨ Features

| | |
|---|---|
| 🤖 **AI Itinerary Generation** | Describe your trip and let Gemini AI craft a day-by-day plan automatically |
| 🔐 **Secure Authentication** | JWT-based auth with bcrypt password hashing, plus Google OAuth via Neon Auth |
| 🧳 **Trip Management** | Create, edit, view, and delete trips from a personal dashboard |
| 🗺️ **Itinerary Builder** | Interactive stop-by-stop itinerary editor for total control over your plan |
| 💰 **Budget Tracking** | Visual budget breakdowns and expense tracking with interactive charts |
| 🧭 **Trip Planner Wizard** | Guided, step-by-step flow from idea → AI-generated plan |
| 📊 **Data Visualizations** | Rich charts via Recharts for trip and budget insights |
| 🌐 **Cloud-Native Database** | Serverless Postgres powered by Neon for fast, scalable storage |
| 📱 **Responsive UI** | Tailwind CSS-driven design that looks great on every screen |

<br/>

## 🧱 Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-338033?style=for-the-badge&logo=letsencrypt&logoColor=white)

### Database & AI
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon_Serverless-00E599?style=for-the-badge&logo=neon&logoColor=black)
![Gemini](https://img.shields.io/badge/Google_Gemini-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white)

### Deployment
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

</div>

<br/>

## 🌐 Live Website

<div align="center">

### 🔗 [globetrotter-nyxo.onrender.com](https://globetrotter-nyxo.onrender.com/)

*Hosted on Render — click above to try Globetrotter live!*

</div>

<br/>

## 📁 Project Structure

```
globetrotter-travel-planner/
├── 🎨 frontend/                  # React + Vite client
│   ├── src/
│   │   ├── pages/                # Dashboard, Login, Register, Trip pages...
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CreateTrip.jsx
│   │   │   ├── MyTrip.jsx
│   │   │   ├── TripPlannerWizard.jsx
│   │   │   ├── IternaryBuilder.jsx
│   │   │   └── TripBudget.jsx
│   │   ├── routes/AppRoutes.jsx  # App routing
│   │   ├── auth.js               # Neon Auth client
│   │   └── App.jsx
│   └── vite.config.js
│
├── ⚙️ backend/                   # Node.js + Express API
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   └── itineraryController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── tripRoutes.js
│   ├── services/                 # AI itinerary service (Gemini)
│   ├── middleware/                # JWT auth middleware
│   ├── validators/
│   ├── config/db.js               # PostgreSQL connection
│   └── index.js
│
└── README.md
```

<br/>

## ⚙️ Getting Started

### ✅ Prerequisites

- **Node.js** v18+
- **PostgreSQL** database (or a [Neon](https://neon.tech/) serverless project)
- A **Google Gemini API key**

### 📥 1. Clone the repository

```bash
git clone https://github.com/<your-username>/globetrotter-travel-planner.git
cd globetrotter-travel-planner
```

### 🔧 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` based on `.env.example`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/globetrotter
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
npm run dev      # starts the API with nodemon
```

### 🎨 3. Frontend setup

```bash
cd frontend
npm install
npm run dev       # starts the Vite dev server
```

### 🚀 4. Open the app

Visit **`http://localhost:5173`** in your browser and start planning! 🧭

<br/>

## 🗺️ How It Works

```mermaid
flowchart LR
    A[👤 User signs up / logs in] --> B[🧳 Create a new trip]
    B --> C[🧭 Trip Planner Wizard]
    C --> D[🤖 Gemini AI generates itinerary]
    D --> E[🗺️ Edit stops in Itinerary Builder]
    E --> F[💰 Track budget & expenses]
    F --> G[✅ Save & view full trip plan]
```

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. 🍴 Fork the project
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔁 Open a Pull Request

<br/>

## 📄 License

This project currently has **no license** — all rights reserved by the author unless stated otherwise.

<br/>

<div align="center">

### 🌟 If you like this project, consider giving it a star!

Made with ❤️ and ☕

**[🔗 Live Demo](https://globetrotter-nyxo.onrender.com/)**

</div>
