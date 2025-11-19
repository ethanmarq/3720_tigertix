require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'user-authentication service running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`User authentication service listening on port ${PORT}`);
  });
}

module.exports = app;
