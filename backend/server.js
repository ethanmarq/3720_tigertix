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

app.use(cors({
  origin: 'http://localhost:3000', // Strictly allow only frontend
  credentials: true,               // Allow cookies
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


