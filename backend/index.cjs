const express = require('express');
const cors = require('cors');
const routes = require('./routes/index.cjs');
const app = express();

// Simple CORS configuration - Allow specific origins
const allowedOrigins = [
  'http://kathasales.com',
  'http://www.kathasales.com',
  'https://kathasales.com',
  'https://www.kathasales.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/api', routes);

// Health check for the API endpoint itself
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Katha Sales API is alive and reachable',
    status: 'running' 
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Katha Sales API Server',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 4000;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app; 