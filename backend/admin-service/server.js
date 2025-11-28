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

app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware, idx) => {
    try {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase());
        routes.push({ methods, path: middleware.route.path });
      } else if (
        middleware.name === 'router' &&
        middleware.handle &&
        middleware.handle.stack &&
        Array.isArray(middleware.handle.stack)
      ) {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase());
            routes.push({ methods, path: handler.route.path });
          }
        });
      }
    } catch (err) {
      console.error(`Error in /api/routes at middleware index ${idx}:`, err);
    }
  });
  res.json(routes);
});

// Homepage route
app.get('/', (req, res) => {
  res.send('API server is running. See /api/routes for available endpoints.');
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Service running on port ${PORT}`);
    });
}

module.exports = app;
