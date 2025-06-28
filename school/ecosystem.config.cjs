module.exports = {
  apps: [
    {
      name: 'school-backend',
      script: 'backend/index.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      }
    },
    {
      name: 'school-frontend',
      script: 'frontend/node_modules/vite/bin/vite.js',
      args: 'preview --port 5179',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}; 