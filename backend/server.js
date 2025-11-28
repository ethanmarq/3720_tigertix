// backend/server.js
const express = require('express');
const cors = require('cors');

// Import services
const adminApp = require('./admin-service/server');
const clientApp = require('./client-service/server');
const authApp = require('./user-authentication/server');
const llmApp = require('./llm-service/server'); // Added this

const app = express();
const PORT = process.env.PORT || 10000;

// Define all allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://tigertix-backend.onrender.com'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount Microservices
app.use('/auth', authApp);
app.use('/', adminApp);
app.use('/', clientApp);
app.use('/', llmApp); // Added this

app.get('/', (req, res) => {
  res.send('TigerTix Unified Backend is Running');
});

app.listen(PORT, () => {
  console.log(`Unified Backend running on port ${PORT}`);
});


