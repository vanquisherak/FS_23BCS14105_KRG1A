const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const { formatJoiErrors } = require('../utils/validation');
const User = require('../models/User');
const Review = require('../models/Review');
const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const Audit = require('../models/Audit');
const auth = require('../middleware/auth');

const promoteLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: 'Too many promote attempts, try later' });

const router = express.Router();

const registerSchema = Joi.object({ name: Joi.string().required(), email: Joi.string().email().required(), password: Joi.string().min(6).required() });

router.post('/register', async (req, res) => {
  try {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ errors: formatJoiErrors(error, { name: 'Name', email: 'Email', password: 'Password' }) });
    const { name, email, password } = value;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username: email, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: 'Email already registered' });
    res.status(500).json({ message: 'Server error' });
  }
});

const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });

router.post('/login', async (req, res) => {
  try {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ errors: formatJoiErrors(error, { email: 'Email', password: 'Password' }) });
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalReviews,
      recentReviews,
      wishlistCount,
      readingCount,
      completedCount,
      submissionsCount,
      recentSubmissions,
  wishlistItems,
    ] = await Promise.all([
      Review.countDocuments({ user: userId }),
      Review.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('book', 'title author averageRating ratingsCount'),
      UserBook.countDocuments({ user: userId, isWishlisted: true }),
      UserBook.countDocuments({ user: userId, readingStatus: 'reading' }),
      UserBook.countDocuments({ user: userId, readingStatus: 'completed' }),
      Book.countDocuments({ createdBy: userId, isCommunity: true }),
      Book.find({ createdBy: userId, isCommunity: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title author createdAt averageRating ratingsCount'),
      UserBook.find({ user: userId, isWishlisted: true })
        .sort({ dateAdded: -1 })
        .limit(5)
        .populate('book'),
    ]);

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        joinedAt: req.user.createdAt,
      },
      stats: {
        totalReviews,
        wishlistCount,
        readingCount,
        completedCount,
        submissionsCount,
      },
      recentReviews,
      wishlist: wishlistItems
        .map((entry) => {
          if (!entry.book) return null;
          const book = entry.book.toObject ? entry.book.toObject() : entry.book;
          return {
            ...book,
            dateAdded: entry.dateAdded,
            readingStatus: entry.readingStatus,
          };
        })
        .filter(Boolean),
      submissions: recentSubmissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote a user to admin (admin-only)
const promoteSchema = Joi.object({ email: Joi.string().email(), id: Joi.string().length(24) });

// promote user (admin-only) with rate limiting and validation
router.post('/promote', auth, promoteLimiter, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
    const { error, value } = promoteSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const { email, id } = value;
    if (!email && !id) return res.status(400).json({ message: 'Provide email or id' });
    const query = email ? { email } : { _id: id };
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = true;
    await user.save();

    // write audit
    await Audit.create({ action: 'promote', actor: req.user._id, targetEmail: user.email, details: { by: req.user.email } });

    res.json({ message: 'Promoted', user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demote endpoint (admin-only)
router.post('/demote', auth, promoteLimiter, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
    const { email, id } = req.body;
    if (!email && !id) return res.status(400).json({ message: 'Provide email or id' });
    const query = email ? { email } : { _id: id };
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = false;
    await user.save();
    await Audit.create({ action: 'demote', actor: req.user._id, targetEmail: user.email, details: { by: req.user.email } });
    res.json({ message: 'Demoted', user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Password reset: request a reset token
const crypto = require('crypto');
const PasswordReset = require('../models/PasswordReset');
const nodemailer = require('nodemailer');

async function sendResetEmail(to, token) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT || 587, secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@example.com', to, subject: 'Password reset', text: `Reset: ${resetUrl}` });
  } else {
    console.log('Password reset link for', to, resetUrl);
  }
}

router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await PasswordReset.create({ user: user._id, token, expiresAt });
    await sendResetEmail(email, token);
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm password reset
router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });
    const pr = await PasswordReset.findOne({ token }).populate('user');
    if (!pr || pr.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired token' });
    const user = await User.findById(pr.user._id);
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await PasswordReset.deleteMany({ user: user._id });
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

