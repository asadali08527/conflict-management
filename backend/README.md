# Conflict Management System Backend

A comprehensive conflict resolution platform backend API built with Node.js, Express, and MongoDB. This system provides functionality for managing matrimonial disputes and is expandable to other conflict types (land disputes, property issues, family conflicts, etc.).

## Features

- **User Authentication**: Secure registration and login with JWT
- **User Profile Management**: Create and update user profiles with file upload capability
- **Case Management**: Create, view, update, and delete conflict cases
- **File Upload**: Secure document upload for cases and profile pictures
- **Security**: Comprehensive security measures including input validation, rate limiting, and protection against common web vulnerabilities

## Tech Stack

- **Node.js & Express**: Server and API framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication and authorization
- **Multer**: File upload handling
- **Joi**: Input validation
- **Bcrypt**: Password hashing
- **Helmet, XSS-Clean, CORS**: Security middleware

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd conflict-management-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/conflict-management
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=24h
   FILE_UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10000000
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login and get JWT token

### User Management

- **GET /api/users/profile**: Get current user profile
- **PUT /api/users/profile**: Update user profile
- **PUT /api/users/change-password**: Change user password

### Case Management

- **POST /api/cases**: Create a new case
- **GET /api/cases**: Get all cases (paginated)
- **GET /api/cases/:id**: Get a specific case by ID
- **PUT /api/cases/:id/status**: Update case status
- **DELETE /api/cases/:id**: Delete a case

## Security Features

- **JWT Authentication**: Secure route protection
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Comprehensive validation with Joi
- **Rate Limiting**: Protection against brute force attacks
- **XSS Protection**: Prevention of cross-site scripting attacks
- **Secure Headers**: Implementation of security-related HTTP headers
- **File Upload Security**: File type validation, size limits, and malware scanning

## Project Structure

```
src/
├── config/
│   ├── database.js    # MongoDB connection
│   └── jwt.js         # JWT configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── userController.js   # User management logic
│   └── caseController.js   # Case management logic
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── security.js        # Security middleware
│   ├── upload.js          # File upload middleware
│   └── validation.js      # Input validation middleware
├── models/
│   ├── User.js            # User model
│   └── Case.js            # Case model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User routes
│   └── cases.js           # Case routes
├── utils/
│   ├── validators.js      # Validation schemas
│   └── fileValidator.js   # File validation utilities
└── app.js                 # Main application entry point
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Running in Production Mode

```bash
npm start
```

## Future Enhancements

- Integration with notification systems
- Advanced reporting and analytics
- Document generation for legal proceedings
- Integration with calendar systems for scheduling
- Mobile application support

## License

ISC