require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.route'); // Ensure filename matches (e.g., users.routes.js or users.route.js)
const dashboardRoutes = require('./routes/dashboard.routes');
const workflowRoutes = require('./routes/workflow.routes');

const app = express();
const PORT = Number(process.env.PORT || 5001);

// Configure CORS - handles preflight (OPTIONS) automatically for all routes
app.use(
  cors({
    origin: true, // or specify frontend URL like 'http://localhost:3000'
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workflow', workflowRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack || err.message || err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;