# TechCareer - Tech Education & Training Platform

> **IMPORTANT NOTICE: This is an AI-generated website created as a personal hobby project. Commercial use is strictly prohibited without explicit permission from the author. All rights reserved. Copyright © 2023.**

TechCareer is a platform for tech education, training, and career advancement resources featuring course marketplace, webinars, and user profiles.

## Overview

A modern platform where users can explore courses, register for webinars, and track learning progress.

**Tech Stack**: HTML5, CSS3, JavaScript, Bootstrap 5, Node.js, Express.js, SQLite3

## Features
- User registration and authentication
- Course catalog with enrollment functionality
- Webinar registration
- Profile management
- Responsive design

## Setup

### Backend Setup
```bash
cd backend
npm install
npm run init-db
npm start
```

### Frontend Access
Access via `http://localhost:3000/index.html` or open HTML files directly

## Documentation

### Frontend
- **Pages**: Home, Courses, Profile, Login/Signup, etc.
- **Components**: Bootstrap 5 UI elements
- **Core Files**: auth.js, course-manager.js, form-validation.js

### Backend
The Node.js/Express.js server provides the following key API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register user |
| `/api/login` | POST | User login |
| `/api/courses` | GET | Get courses |
| `/api/purchase` | POST | Enroll in course |
| `/api/user/:userId` | PUT | Update profile |

### Database
SQLite3 database with tables for users, courses, enrollments, and webinars.

## Demo Accounts
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## License
This project is for personal use only. All rights reserved.

## Contact
For inquiries: your-email@example.com

---
*This is an AI-generated educational project. Not intended for commercial use.*
# techcareer
