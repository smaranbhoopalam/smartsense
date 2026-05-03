# LifeGuard.AI - Backend (Manvil's Core)

## Setup Instructions
1. Create a `.venv` and run `pip install fastapi uvicorn httpx python-dotenv`.
2. Create a `.env` file and add your `GEMINI_API_KEY`.
3. Run the server using: `python backend/main.py`

## Features Completed
- **Google OAuth Sync:** Secure user registration.
- **SQLite Database:** Stores weight goals (e.g., 68kg) and profile data.
- **Gemini AI Consultant:** Provides 2-line personalized health tips.
- **AI Stress Calculator:** Estimates stress levels based on user lifestyle and mood via Gemini API.
- **Health Wearables Integration:** Supports optional `steps_per_day` and `heart_rate` inputs for more accurate health predictions.
- **Error Handling:** Built-in safety tips if the AI service is offline.