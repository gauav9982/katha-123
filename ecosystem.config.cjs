module.exports = {
  apps: [{
    name: 'katha-sales-backend',
    script: './backend/index.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
} 