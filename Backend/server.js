// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware (allows us to accept JSON data in the body)
app.use(express.json());
// CORS middleware (allows a frontend to communicate with this API later)
app.use(cors());

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('GIU Nexus API is running...');
});

// --- Your Team's Routes Will Go Here Later ---
// e.g., app.use('/api/v1/auth', authRoutes);

// Custom Error Handler Middleware (Must be below all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});