module.exports = {
  apps: [
    {
      name: 'katha-sales-backend',
      script: './backend/index.cjs',
      watch: false,
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
}; 