const express = require('express');
const cors = require('cors');
const setupDatabase = require('./setup');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = 5001;

// Initialize database
setupDatabase();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.use('/api', adminRoutes);

app.listen(PORT, () => {
    console.log(`Admin service running at http://localhost:${PORT}`);
});
