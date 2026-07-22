# AI Resume Builder

A premium, state-of-the-art AI-powered Resume Builder built with Next.js (React + TypeScript), Node.js (Express + TypeScript), Firebase Firestore, Firebase Authentication, and Google Gemini AI.

---

## 1. Project Directory Map
*   **[/frontend](file:///c:/Users/subha/OneDrive/Desktop/AI_Resume_Builder/frontend)**: Next.js App Router client using vanilla CSS modules.
*   **[/backend](file:///c:/Users/subha/OneDrive/Desktop/AI_Resume_Builder/backend)**: Express server with TypeScript incorporating validation, rate-limiting, and testing frameworks.
*   **[firestore.rules](file:///c:/Users/subha/OneDrive/Desktop/AI_Resume_Builder/firestore.rules)**: Role-based document database policies.

---

## 2. Developer Staging Setup

### A. Prerequisites
*   Node.js (v18 or higher)
*   NPM (v9 or higher)

### B. Environment Mappings
To make local evaluation seamless, both frontend and backend directories are configured with **Mock Fallback Drivers**. If environment variables are omitted or contain placeholder dummy credentials, the application automatically redirects transactions to local memory maps and mock AI outputs.

#### Backend Env Config ([/backend/.env](file:///c:/Users/subha/OneDrive/Desktop/AI_Resume_Builder/backend/.env))
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
FIREBASE_PROJECT_ID=dummy-project-id
FIREBASE_CLIENT_EMAIL=dummy-client@example.com
FIREBASE_PRIVATE_KEY=your-firebase-private-key-contents
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend Env Config ([/frontend/.env.local](file:///c:/Users/subha/OneDrive/Desktop/AI_Resume_Builder/frontend/.env.local))
Create a `.env.local` file inside the `frontend` folder:
```env
NEXT_PUBLIC_BACKEND_URL=https://ai-resume-builder-ysoe.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=dummy-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dummy-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dummy-project-id
```

### C. Launch Instructions

#### Step 1: Start Backend API Server
1. Navigate to `/backend`
2. Run installation:
   ```bash
   npm install
   ```
3. Run the development watcher server:
   ```bash
   npm run dev
   ```
   *The server starts listening on: `https://ai-resume-builder-ysoe.onrender.com`*

#### Step 2: Run Security Test Suite
Verify rate limiters, input sanitizers, and validation controls:
1. Inside `/backend`
2. Execute tests:
   ```bash
   npm run test
   ```

#### Step 3: Start Frontend Client
1. Navigate to `/frontend`
2. Run installation:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to: `https://ai-resume-builder-cyan-phi.vercel.app`*

---

## 3. Production Deployment Guide

### A. Backend - Google Cloud Run
The backend server includes a multi-stage Docker build file optimized for serverless container engines.

1. Install Google Cloud SDK (`gcloud` CLI).
2. Authenticate and set your target Google Cloud Project ID:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Build and submit your container to Artifact Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-resume-backend c:\Users\subha\OneDrive\Desktop\AI_Resume_Builder\backend
   ```
4. Deploy the service to Google Cloud Run:
   ```bash
   gcloud run deploy ai-resume-backend \
     --image gcr.io/YOUR_PROJECT_ID/ai-resume-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY=REAL_GEMINI_KEY
   ```
   *Note: Cloud Run will output a public Service URL (e.g. `https://ai-resume-backend-xyz.run.app`).*

### B. Frontend - Vercel
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Navigate to `/frontend` and trigger deployment command:
   ```bash
   vercel
   ```
3. Configure the environment variables inside Vercel Dashboard settings:
   *   Set `NEXT_PUBLIC_BACKEND_URL` to your Google Cloud Run Service URL.
   *   Set real client-side Firebase API keys.
4. Deploy to production:
   ```bash
   vercel --prod
   ```
