const pino = require('pino');
const pinoHttp = require('pino-http');

/**
 * P2: Structured logging with Pino
 * Replaces morgan for better performance and structured JSON logs
 */

/**
 * Create base logger instance
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined, // In production, output raw JSON for log aggregators
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      // Don't log body by default (may contain sensitive data)
      // body: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Create HTTP request logger middleware
 */
const httpLogger = pinoHttp({
  logger,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
  customSuccessMessage: function (req, res) {
    if (res.statusCode === 404) {
      return 'resource not found';
    }
    return `${req.method} ${req.url}`;
  },
  customErrorMessage: function (req, res, err) {
    return `${req.method} ${req.url} - ${err.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  // Don't log health check endpoints to reduce noise
  autoLogging: {
    ignore: (req) => {
      return (
        req.url === '/api/healthz' ||
        req.url === '/api/readyz' ||
        req.url === '/api/health'
      );
    },
  },
});

module.exports = {
  logger,
  httpLogger,
};
