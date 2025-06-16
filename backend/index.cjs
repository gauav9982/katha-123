const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const app = express();

// Enable CORS with dynamic origin handling
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed domains
    const allowedDomains = [
      'http://kathasales.com',
      'http://www.kathasales.com',
      'https://kathasales.com',
      'https://www.kathasales.com'
    ];
    
    // Allow any localhost origin
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed domains
    if (allowedDomains.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
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

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Katha Sales API Server',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

module.exports = app; 