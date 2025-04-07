# TechCareer

A tech education and training platform built with Node.js, Express, and Bootstrap.

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Running Locally

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Accessing the Frontend

Once the server is running, you can access the frontend in two ways:

1. Through the Express server (recommended):
   - Open your browser and navigate to: `http://localhost:3000/index.html`

2. By opening the HTML files directly from the filesystem:
   - Navigate to the `/frontend` directory
   - Open any HTML file in your browser

### Demo Accounts

For testing the application:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register user |
| `/api/login` | POST | User login |
| `/api/courses` | GET | Get courses |
| `/api/purchase` | POST | Enroll in course |
| `/api/user/:userId` | PUT | Update profile |

---
*Note: This is a personal educational project. Not intended for commercial use.*
