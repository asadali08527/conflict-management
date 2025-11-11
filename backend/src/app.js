const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { specs, swaggerUi } = require('./config/swagger');

dotenv.config();

// Connect to database
const connectDB = require('./config/database');
connectDB();

// Import security middleware
const configureSecurityMiddleware = require('./middleware/security');

// Initialize express app
const app = express();

// Apply security middleware (helmet, xss, cors, rate limiting)
configureSecurityMiddleware(app);

// Body parser
app.use(express.json({ limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/case-submission', require('./routes/caseSubmission'));
app.use('/api/panelists', require('./routes/panelists'));
app.use('/api/panelist', require('./routes/panelistRoutes'));
app.use('/api/client', require('./routes/clientRoutes'));
app.use('/api/files', require('./routes/files'));
app.get('/test', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Test endpoint working' });
});
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
