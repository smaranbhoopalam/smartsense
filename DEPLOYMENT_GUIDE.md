# LifeGuard.AI Deployment Guide

Welcome to the deployment phase! Since you have a modern stack (React/Vite for the frontend and Python/FastAPI for the backend), we will use two excellent, beginner-friendly platforms: **Render** for the backend and **Vercel** for the frontend. Both offer generous free tiers.

> [!IMPORTANT]  
> Because our backend uses a local SQLite database (`lifeguard.db`), please note that on Render's free tier, local files are reset every time the server restarts or deploys. For a beginner project, this is completely fine, but just be aware that new user profiles might reset occasionally! (Your health history logs saved in MongoDB will be completely safe).

---

## Part 1: Deploying the Backend (Render)

Render will host your FastAPI server and your machine learning model.

1. **Sign Up**: Go to [Render.com](https://render.com/) and create an account using your GitHub login.
2. **Create a Web Service**: 
   - On the dashboard, click **New +** and select **Web Service**.
   - Choose **Build and deploy from a Git repository**.
   - Connect your GitHub account and select your `LifeGuard.AI` repository.
3. **Configure the Service**:
   - **Name**: `lifeguard-backend` (or whatever you prefer)
   - **Root Directory**: `backend` (⚠️ *Very important! Leave the rest as default*)
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables** (Optional but Recommended):
   - Expand the **Advanced** section.
   - If you have an API key like `GEMINI_API_KEY` or `SECRET_KEY`, click **Add Environment Variable** and paste them here.
5. **Deploy**:
   - Click **Create Web Service**. 
   - Render will now download your code and install everything. This can take 3-5 minutes.
6. **Save your API URL**:
   - Once it says `Live` ✅, look near the top left for your Render URL (it looks like `https://lifeguard-backend-xxxx.onrender.com`). Copy this link!

---

## Part 2: Deploying the Frontend (Vercel)

Vercel is the easiest way to host React (Vite) apps.

1. **Sign Up**: Go to [Vercel.com](https://vercel.com/) and sign up using GitHub.
2. **Add New Project**:
   - Click **Add New...** -> **Project**.
   - Import your `LifeGuard.AI` GitHub repository.
3. **Configure the Project**:
   - **Framework Preset**: Vite (Vercel should detect this automatically).
   - **Root Directory**: Click the "Edit" button and select the `frontend` folder. (⚠️ *Very important!*)
4. **Environment Variables**:
   - Click to expand the **Environment Variables** section.
   - **Name**: `VITE_API_URL`
   - **Value**: Paste the exact Render URL you copied earlier from your backend (make sure there's no trailing slash `/` at the end).
5. **Deploy**:
   - Click **Deploy**. Vercel will build your React application.
6. **Congratulations**:
   - Within a minute, you'll get a screen with confetti! Your site is live!

---

## Part 3: Final Integrations & Checks

Because your app relies on Google Authentication, we need to tell Google that your *new* live website is allowed to log users in.

1. Go to your [Google Cloud Console](https://console.cloud.google.com/) where you created your OAuth credentials.
2. Find your Web Client ID credentials.
3. Add your new Vercel URL (e.g., `https://lifeguard-frontend.vercel.app`) to the **Authorized JavaScript origins**.
4. Save the changes. Include the URL in **Authorized redirect URIs** if you have a specific redirect set.

> [!TIP]
> If you notice the backend is randomly slow when you first try to log in, don't worry! Render's free tier "spins down" (sleeps) when no one uses it for 15 minutes. It takes about 30-50 seconds to wake up on the first request.

You are fully deployed! Feel free to ask if you run into any build errors.
