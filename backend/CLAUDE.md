# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start development server with nodemon (auto-restart on changes)
- `npm start` - Start production server

### Environment Setup
Requires a `.env` file with:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/conflict-management
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=24h
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10000000
```

## Architecture Overview

This is a Node.js/Express REST API for a conflict management platform focused on matrimonial disputes, with plans to expand to other conflict types (land, property, family).

### Core Data Models
- **User**: Authentication and profile management with role-based access (client/admin)
- **Case**: Conflict case management with support for multiple parties, document uploads, and notes

### Security Implementation
- JWT-based authentication with middleware protection
- Input validation using Joi schemas
- File upload security with type/size validation
- Rate limiting, XSS protection, and security headers via middleware
- Password hashing with bcryptjs

### Key Architecture Patterns
- **MVC Structure**: Controllers handle business logic, models define data schemas
- **Middleware Chain**: Security → Auth → Validation → Controllers
- **Route Organization**: Separate route files for auth, users, and cases
- **Error Handling**: Centralized error middleware with environment-aware stack traces

### File Upload System
- Uses Multer for file handling
- Uploads stored in `/uploads` directory
- File validation in `src/utils/fileValidator.js`
- Security checks for file types and sizes

### API Documentation
- Swagger documentation available at `/api-docs`
- Configuration in `src/config/swagger.js`

### Database
- MongoDB with Mongoose ODM
- Connection configuration in `src/config/database.js`
- Pre-save hooks for password hashing and timestamp updates