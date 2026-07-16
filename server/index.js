import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

// Import Models for Sync
import User from './models/User.js';
import ConnectedAccount from './models/ConnectedAccount.js';
import Template from './models/Template.js';
import Email from './models/Email.js';
import ScheduledEmail from './models/ScheduledEmail.js';

// Import Routes
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import templateRoutes from './routes/templates.js';
import emailRoutes from './routes/emails.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/emails', emailRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Email Automation API is running...');
});

// Database Sync and Server Listen
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✔ MySQL Database Models Synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`✔ Secure Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✘ Failed to synchronize database models:', err.message);
  });
