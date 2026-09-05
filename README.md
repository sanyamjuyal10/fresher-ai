# Fresher.AI

> An AI-powered career workspace for sharper resumes, better interviews, and practical learning roadmaps.

<div align="center">
  <p>
    <strong>Resume scoring</strong>&nbsp;&nbsp;•&nbsp;&nbsp;
    <strong>AI interviews</strong>&nbsp;&nbsp;•&nbsp;&nbsp;
    <strong>Personalized roadmaps</strong>
  </p>
</div>

## Product Preview

<p align="center">
  <img src="docs/screenshots/resume-scorer.png" width="31%" alt="Resume scorer" />
  <img src="docs/screenshots/dashboard.png" width="31%" alt="Fresher.AI dashboard" />
  <img src="docs/screenshots/roadmap.png" width="31%" alt="Roadmap generator" />
</p>

## What It Does

- **Resume Scorer** — extracts resume information, scores ATS readiness, and highlights strengths, weaknesses, missing skills, and recommendations.
- **Resume Builder** — create and preview a structured, ATS-friendly resume.
- **AI Interviews** — practice technical and HR interviews with adaptive questions, feedback, and reports.
- **Roadmap Generator** — turn a target role, salary goal, and resume into a focused learning path.
- **Progress Dashboard** — track interviews, scores, completed sessions, and interview credits.
- **Google Authentication** — secure sign-in through Firebase Authentication.

## Architecture

```text
React + Vite frontend
          │
          ▼
Express API gateway :8000
    ┌─────┼─────┬─────────┬─────────┐
    ▼     ▼     ▼         ▼         ▼
 Auth  Interview Resume  Roadmap  Billing
:8001   :8002   :8003    :8004     :8005
    └──────────────┬───────────────┘
                   ▼
          MongoDB Atlas + Redis
```

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Redux Toolkit, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| AI | LangChain, Groq models, LangGraph |
| Authentication | Firebase Authentication and Firebase Admin |
| Data | MongoDB Atlas and Redis |
| Payments | Razorpay |

## Run Locally

### 1. Install dependencies

```powershell
cd frontend
npm install

cd ..\backend\gateway
npm install

cd ..\services\auth-service
npm install

cd ..\billing-service
npm install

cd ..\interview-service
npm install

cd ..\resume-service
npm install

cd ..\roadmap-service
npm install
```

### 2. Start Redis

```powershell
cd backend
 docker compose up -d redis
```

### 3. Configure environment files

Create the ignored `.env` files from the values used by your local services. Never commit API keys, database passwords, Firebase service accounts, or `.env` files.

Required backend configuration includes:

```env
PORT=8001
MONGODB_URL=mongodb://...
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=...
```

The frontend requires:

```env
VITE_FIREBASE_APIKEY=...
VITE_RAZORPAY_KEY_ID=...
```

Add the machine's current public IP to the MongoDB Atlas Network Access list before starting the services.

### 4. Start services

Run each command in a separate terminal:

```powershell
# Gateway
cd backend\gateway
npm start
```

```powershell
# Auth
cd backend\services\auth-service
npm run dev
```

```powershell
# Interview
cd backend\services\interview-service
npm run dev
```

```powershell
# Resume
cd backend\services\resume-service
npm run dev
```

```powershell
# Roadmap
cd backend\services\roadmap-service
npm run dev
```

```powershell
# Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Service Map

| Service | Port | Responsibility |
| --- | ---: | --- |
| Gateway | 8000 | CORS, cookies, authentication middleware, proxying |
| Auth | 8001 | Firebase token verification, users, sessions, credits |
| Interview | 8002 | Interview graph, questions, feedback, reports |
| Resume | 8003 | PDF extraction, AI analysis, ATS scoring |
| Roadmap | 8004 | AI roadmap generation and learning resources |
| Billing | 8005 | Razorpay orders and payment verification |

## Security Notes

- Rotate any API keys or database credentials that have been exposed during development.
- Keep `.env` files and `serviceAccountKey.json` outside Git.
- Use a specific `/32` IP in Atlas for local development instead of `0.0.0.0/0`.
- Do not use production credentials in local development.

## License

This project is currently provided for personal and educational use.
