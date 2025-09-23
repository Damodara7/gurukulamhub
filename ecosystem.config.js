module.exports = {
  apps: [
    {
      name: 'gurukulamhub-app',
      script: 'next-node-express-server.mjs',
      cwd: '/var/www/gurukulamhub',
      instances: 1, // Use 'max' for cluster mode
      exec_mode: 'fork', // Use 'cluster' for load balancing
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      log_file: '/var/log/pm2/gurukulamhub-combined.log',
      out_file: '/var/log/pm2/gurukulamhub-out.log',
      error_file: '/var/log/pm2/gurukulamhub-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Memory management
      max_memory_restart: '1G',
      
      // Monitoring
      watch: false, // Set to true for development
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Advanced options
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Source map support
      source_map_support: true,
      
      // Auto restart on file changes (development only)
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        interval: 1000,
      },
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu', // Change to your server user
      host: 'your-server-ip', // Change to your server IP
      ref: 'origin/main',
      repo: 'https://github.com/Damodara7/gurukulamhub.git',
      path: '/var/www/gurukulamhub',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --production=false && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'post-setup': 'npm install -g pm2',
    },
    staging: {
      user: 'ubuntu',
      host: 'your-staging-server-ip',
      ref: 'origin/develop',
      repo: 'https://github.com/Damodara7/gurukulamhub.git',
      path: '/var/www/gurukulamhub-staging',
      'post-deploy': 'npm ci --production=false && npm run build && pm2 reload ecosystem.config.js --env staging',
    },
  },
};
