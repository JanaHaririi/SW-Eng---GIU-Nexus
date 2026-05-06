require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');

const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');   // ✅ added
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

// Trust the first proxy in front of the app (e.g. Nginx, Heroku, Render, Cloudflare)
// so req.ip reflects the real client address used by the rate limiter.
app.set('trust proxy', 1);

// Middleware
app.use(express.json());

app.use(cors());

// Home route
app.get('/', (req, res) => {
  res.send('GIU Nexus API is running...');
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/profile', profileRoutes);

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);

app.use('/api/v1/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// In tests, supertest requires this file just to grab the configured `app`.
// Skip the DB connect + listen so the test suite can drive its own lifecycle
// (mongodb-memory-server connection in tests/setup.js).
if (process.env.NODE_ENV !== 'test') {
  connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
