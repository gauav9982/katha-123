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
    {
      name: 'school-backend',
      script: './school/backend/index.cjs',
      watch: false,
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      error_file: './school/logs/err.log',
      out_file: './school/logs/out.log',
      log_file: './school/logs/combined.log',
      time: true,
    },
    {
      name: 'school-frontend',
      script: 'cd school/frontend && npm run preview',
      watch: false,
      exec_mode: 'fork',
      instances: 1,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5179,
      },
      error_file: './school/logs/frontend-err.log',
      out_file: './school/logs/frontend-out.log',
      log_file: './school/logs/frontend-combined.log',
      time: true,
    }
  ],
}; 