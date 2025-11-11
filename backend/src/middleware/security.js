const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');

/**
 * Configure security middleware for the Express application
 * @param {Object} app - Express application instance
 */
const configureSecurityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Prevent XSS attacks
  app.use(xss());

  // Enable CORS with specific options
  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') ||
          'https://resolveit.eliff.tech'
        : // : '*',
          true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Rate limiting for all API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      status: 'error',
      message:
        'Too many requests from this IP, please try again after 15 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use('/api', apiLimiter);

  // More strict rate limiting for authentication routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 login/register attempts per hour
    message: {
      status: 'error',
      message:
        'Too many authentication attempts, please try again after an hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth', authLimiter);

  // Add security headers
  app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none';"
    );

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Strict Transport Security (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

    // Feature policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    next();
  });
};

module.exports = configureSecurityMiddleware;
