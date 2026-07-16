import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ConnectedAccount from '../models/ConnectedAccount.js';
import Template from '../models/Template.js';
import authMiddleware from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email address' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Seed mock account for user to start with
    await ConnectedAccount.create({
      email: `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      status: 'connected',
      isPrimary: true,
      connectionType: 'Gmail OAuth',
      userId: newUser.id
    });

    // Seed default template for user
    await Template.create({
      name: 'Frontend Engineer Application',
      category: 'Job Application',
      subject: 'Application for Frontend Engineer Role - {{candidate_name}}',
      body: `Hi {{company_name}} Team,\n\nMy name is {{candidate_name}}, and I'm writing to apply for the Frontend Engineer position at {{company_name}}.\n\nBest regards,\n{{candidate_name}}`,
      attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
      isFavorite: true,
      userId: newUser.id
    });

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        timezone: newUser.timezone,
        language: newUser.language,
        signature: newUser.signature,
        autoAttachResume: newUser.autoAttachResume
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        language: user.language,
        signature: user.signature,
        autoAttachResume: user.autoAttachResume
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      language: user.language,
      signature: user.signature,
      autoAttachResume: user.autoAttachResume
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email, timezone, language, signature, autoAttachResume } = req.body;
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Update settings in database
    await user.update({
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      timezone: timezone !== undefined ? timezone : user.timezone,
      language: language !== undefined ? language : user.language,
      signature: signature !== undefined ? signature : user.signature,
      autoAttachResume: autoAttachResume !== undefined ? autoAttachResume : user.autoAttachResume
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      language: user.language,
      signature: user.signature,
      autoAttachResume: user.autoAttachResume
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
