require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cookieParser());

app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'user-authentication service running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`User authentication service listening on port ${PORT}`);
  });
}

module.exports = app;
