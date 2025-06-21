module.exports = {
  apps: [
    {
      name: 'katha-sales-backend',
      script: './backend/index.cjs',
      watch: false,
      exec_mode: 'fork', // Changed from 'cluster' to 'fork' to prevent EADDRINUSE errors
      instances: 1,      // Explicitly set to 1 for fork mode
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
}; 