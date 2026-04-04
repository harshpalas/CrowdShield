# CrowdShield Monorepo

This repository contains the full CrowdShield application, structured as a monorepo with a separate backend and frontend.

## Overview

-   **`backend/`**: A Node.js and Express.js server that handles API requests, user authentication, real-time location updates via WebSockets, and interaction with the MongoDB database.
-   **`crowdshield-frontend/`**: A modern React client application built with Vite and TypeScript. It provides the user interface for map visualization, reporting, and interacting with the backend services.

## Getting Started

To run this project locally, you will need to start both the backend server and the frontend development server.

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a local environment file from the example
cp .env.example .env

# IMPORTANT: Open .env and fill in your actual secrets
# (e.g., MongoDB URI, JWT Secret, Cloudinary keys)

# Start the server in development mode (with hot-reloading)
npm run dev
```

The backend server will typically start on `http://localhost:5000`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory from the root
cd crowdshield-frontend

# Install dependencies
npm install

# Create a local environment file if you need to override defaults
# (e.g., VITE_API_URL to point to your backend)
# touch .env.local

# Start the frontend development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Deployment

This monorepo is structured for easy deployment on modern hosting platforms.

-   **Backend**: Deploy the `backend` directory as a web service on platforms like **Render**, **Railway**, or **Heroku**.
    -   Set the `NODE_ENV` environment variable to `production`.
    -   Use the platform's secret management to store your production environment variables.
    -   The start command is `npm start`.

-   **Frontend**: Deploy the `crowdshield-frontend` directory as a static site on platforms like **Vercel**, **Netlify**, or **Cloudflare Pages**.
    -   The build command is `npm run build`.
    -   Set the `VITE_API_URL` environment variable to the URL of your deployed backend service.

## Key Scripts

-   `backend`:
    -   `npm run dev`: Starts the backend with `nodemon`.
    -   `npm start`: Starts the backend for production.
-   `crowdshield-frontend`:
    -   `npm run dev`: Starts the Vite development server.
    -   `npm run build`: Builds the frontend for production.
    -   `npm run lint`: Lints the frontend codebase.