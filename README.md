# Rendezvous Frontend

## Overview
Rendezvous is a location-sharing application where users can discover, create, and manage places with authentic stories from locals and travellers. This repository contains the React frontend application.

## Tech Stack
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- JWT authentication
- CSS with custom styling

## Features
- User authentication (login, register)
- Browse and search places
- Create, edit, and delete your own places
- Image uploads for places and profile avatars
- User profile management
- Protected routes for authenticated pages
- Responsive design

## Routing
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/places` - Main places page (auth required)
- `/profile` - User profile (auth required)

## Setup Instructions

1. **Install dependencies**
```bash
npm install
```

2. **Environment setup**
Create a `.env` file with:
```
VITE_API_URL=http://localhost:8000/api
```

3. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure
```
src/
|-- components/       # Navbar, ProtectedRoute
|-- context/          # AuthContext for global auth state
|-- pages/            # Landing, Login, Register, Places, Profile
|-- api/              # Axios client configuration
|-- App.css           # Global styles
```

## Authentication Flow
- User logs in via `/login`
- JWT tokens are stored in localStorage
- Tokens are automatically refreshed when needed
- Protected routes require authentication
- Logout clears tokens and redirects to the login page

## Known Issues & Dependencies
- Requires backend API running at the configured URL
- CORS must be configured correctly on the backend
- Authentication tokens are stored in localStorage

## Build & Deploy
```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Code linting
```

## AI Assistance Disclaimer
AI tools were used selectively during development to support parts of the UI design, README drafting, debugging, and troubleshooting. This was especially helpful when investigating SendGrid delivery issues and exploring password reset implementation. All final integration, testing, and implementation decisions were reviewed and validated within the project context.
