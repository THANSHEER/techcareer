# TechCareer Backend

This is the backend service for the TechCareer website.

## Setup

1. Install dependencies:
```
npm install
```

2. Initialize the SQLite database:
```
npm run init-db
```

3. Start the server:
```
npm start
```

For development with auto-restart:
```
npm run dev
```

## Database

The application uses SQLite3 for data storage. The database file is created at `techcareer.db`.

### Tables

- **users**: Stores user information
- **courses**: Stores course details
- **enrollments**: Tracks user enrollments in courses

### Demo Account

After initializing the database, you can login with:
- Email: demo@techcareer.com
- Password: demo123

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `GET /api/courses` - Get all available courses
- `GET /api/user/:userId/courses` - Get courses for a specific user
- `POST /api/purchase` - Purchase a course
- `PUT /api/user/:userId/course/:courseId/progress` - Update course progress
- `PUT /api/user/:userId` - Update user profile
- `PUT /api/user/:userId/password` - Change user password
- `GET /api/users` - Get all users (admin only)

## Development

The server uses nodemon for auto-reloading during development.
