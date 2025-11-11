const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isRedisReady } = require('../config/redis');

/**
 * P2: Health check and metrics endpoints for monitoring and orchestration
 * /healthz - Basic liveness probe (is server running?)
 * /readyz - Readiness probe (is server ready to accept traffic?)
 * /metrics - Basic metrics in Prometheus format (optional)
 */

/**
 * @swagger
 * /api/healthz:
 *   get:
 *     summary: Liveness probe
 *     description: Basic health check - returns 200 if server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: 2025-11-11T12:00:00.000Z
 */
router.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/readyz:
 *   get:
 *     summary: Readiness probe
 *     description: Comprehensive readiness check - verifies DB and Redis connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready to accept traffic
 *       503:
 *         description: Server is not ready (dependencies unavailable)
 */
router.get('/readyz', async (req, res) => {
  const checks = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      mongodb: 'unknown',
      redis: 'unknown',
    },
  };

  let allHealthy = true;

  // Check MongoDB connection
  try {
    const mongoState = mongoose.connection.readyState;
    /*
     * 0 = disconnected
     * 1 = connected
     * 2 = connecting
     * 3 = disconnecting
     */
    if (mongoState === 1) {
      checks.checks.mongodb = 'connected';
    } else if (mongoState === 2) {
      checks.checks.mongodb = 'connecting';
      allHealthy = false;
    } else {
      checks.checks.mongodb = 'disconnected';
      allHealthy = false;
    }
  } catch (error) {
    checks.checks.mongodb = `error: ${error.message}`;
    allHealthy = false;
  }

  // Check Redis connection
  try {
    const redisReady = await isRedisReady();
    if (redisReady) {
      checks.checks.redis = 'connected';
    } else {
      checks.checks.redis = 'unavailable';
      // Redis is optional, so don't fail readiness check
      // allHealthy = false;
    }
  } catch (error) {
    checks.checks.redis = `error: ${error.message}`;
    // Redis is optional
  }

  if (allHealthy) {
    res.status(200).json(checks);
  } else {
    checks.status = 'not_ready';
    res.status(503).json(checks);
  }
});

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Basic metrics endpoint
 *     description: Returns basic system metrics in Prometheus-compatible format
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = [];
    const timestamp = Date.now();

    // Process uptime
    const uptimeSeconds = process.uptime();
    metrics.push(`# HELP process_uptime_seconds Process uptime in seconds`);
    metrics.push(`# TYPE process_uptime_seconds gauge`);
    metrics.push(`process_uptime_seconds ${uptimeSeconds.toFixed(2)}`);

    // Memory usage
    const memUsage = process.memoryUsage();
    metrics.push(`\n# HELP process_memory_rss_bytes Resident Set Size memory in bytes`);
    metrics.push(`# TYPE process_memory_rss_bytes gauge`);
    metrics.push(`process_memory_rss_bytes ${memUsage.rss}`);

    metrics.push(`\n# HELP process_memory_heap_used_bytes Heap used memory in bytes`);
    metrics.push(`# TYPE process_memory_heap_used_bytes gauge`);
    metrics.push(`process_memory_heap_used_bytes ${memUsage.heapUsed}`);

    metrics.push(`\n# HELP process_memory_heap_total_bytes Heap total memory in bytes`);
    metrics.push(`# TYPE process_memory_heap_total_bytes gauge`);
    metrics.push(`process_memory_heap_total_bytes ${memUsage.heapTotal}`);

    // MongoDB connection state
    const mongoState = mongoose.connection.readyState;
    metrics.push(`\n# HELP mongodb_connection_state MongoDB connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    metrics.push(`# TYPE mongodb_connection_state gauge`);
    metrics.push(`mongodb_connection_state ${mongoState}`);

    // MongoDB connection pool stats (if available)
    if (mongoose.connection.client && mongoose.connection.client.topology) {
      const poolStats = mongoose.connection.client.topology.s?.pool?.totalConnectionCount || 0;
      metrics.push(`\n# HELP mongodb_connection_pool_total Total MongoDB connections in pool`);
      metrics.push(`# TYPE mongodb_connection_pool_total gauge`);
      metrics.push(`mongodb_connection_pool_total ${poolStats}`);
    }

    // Redis connection state
    const redisReady = await isRedisReady();
    metrics.push(`\n# HELP redis_connection_state Redis connection state (0=disconnected, 1=connected)`);
    metrics.push(`# TYPE redis_connection_state gauge`);
    metrics.push(`redis_connection_state ${redisReady ? 1 : 0}`);

    // Node.js version info
    metrics.push(`\n# HELP nodejs_version_info Node.js version`);
    metrics.push(`# TYPE nodejs_version_info gauge`);
    metrics.push(`nodejs_version_info{version="${process.version}"} 1`);

    // Environment
    const env = process.env.NODE_ENV || 'development';
    metrics.push(`\n# HELP app_environment Application environment`);
    metrics.push(`# TYPE app_environment gauge`);
    metrics.push(`app_environment{env="${env}"} 1`);

    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(metrics.join('\n') + '\n');
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).send('# Error generating metrics\n');
  }
});

module.exports = router;
