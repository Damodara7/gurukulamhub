// Health check API endpoint for Kubernetes
// Place this in: src/app/api/health/route.js

export async function GET() {
  try {
    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Optional: Check database connection
    // const dbStatus = await checkDatabaseConnection()
    // healthStatus.database = dbStatus

    // Optional: Check Redis connection
    // const redisStatus = await checkRedisConnection()
    // healthStatus.redis = redisStatus

    return Response.json(healthStatus, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

