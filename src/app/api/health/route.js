// Health check API endpoint for Kubernetes liveness and readiness probes

export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }

    // Optional: Add database health check here if needed
    // try {
    //   // Check MongoDB connection
    //   const dbStatus = await checkDatabaseConnection()
    //   healthStatus.database = dbStatus
    // } catch (error) {
    //   healthStatus.database = { status: 'error', message: error.message }
    // }

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

