const express = require('express');
const rateLimit = require('express-rate-limit');
const Book = require('../models/Book');
const Joi = require('joi');
const { formatJoiErrors } = require('../utils/validation');
const Review = require('../models/Review');
const UserBook = require('../models/UserBook');
const auth = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const reviewCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reviews submitted. Please try again shortly.' }
});

// Create a book (could be admin-only; for now open)
const bookSchema = Joi.object({ title: Joi.string().min(1).required(), author: Joi.string().allow('', null), description: Joi.string().allow('', null), category: Joi.string().allow('', null), tags: Joi.array().items(Joi.string()).optional() });

router.post('/community', auth, async (req, res) => {
  try {
    const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ errors: formatJoiErrors(error, { title: 'Title', author: 'Author', description: 'Description', category: 'Category' }) });

    const { title } = value;
    const existing = await Book.findOne({ title: new RegExp(`^${escapeRegex(title.trim())}$`, 'i') });
    if (existing) return res.status(409).json({ message: 'This book already exists in Bookverse.' });

    const book = await Book.create({ ...value, createdBy: req.user?._id, isCommunity: true, tags: value.tags || [] });
    res.status(201).json({ book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    // require admin
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ errors: formatJoiErrors(error, { title: 'Title', author: 'Author', description: 'Description', category: 'Category' }) });
  const { title, author, description, category, tags } = value;
  const book = await Book.create({ title, author, description, category, tags: tags || [] });
    res.status(201).json({ book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List books, optional sort by rating
router.get('/', async (req, res) => {
  try {
    // pagination
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20')));
    const skip = (page - 1) * limit;

    // filters
  const q = req.query.q;
    const author = req.query.author;
  const tag = req.query.tag;
    const community = req.query.community;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;
    const maxRating = req.query.maxRating ? parseFloat(req.query.maxRating) : null;

    const filter = {};
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    if (author) filter.author = new RegExp(author, 'i');
  if (tag) filter.tags = tag;
    if (typeof community !== 'undefined') {
      const isCommunity = community === 'true' || community === '1';
      if (isCommunity) {
        filter.isCommunity = true;
      } else if (community === 'false' || community === '0') {
        filter.isCommunity = { $ne: true };
      }
    }
    if (minRating !== null || maxRating !== null) {
      filter.averageRating = {};
      if (minRating !== null) filter.averageRating.$gte = minRating;
      if (maxRating !== null) filter.averageRating.$lte = maxRating;
    }

    const sort = req.query.sort === 'rating' ? { averageRating: -1 } : { createdAt: -1 };
    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter).sort(sort).skip(skip).limit(limit);
    res.json({ page, limit, total, books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a book (admin-only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ errors: formatJoiErrors(error, { title: 'Title', author: 'Author', description: 'Description', category: 'Category' }) });
    const updates = value;
    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!book) return res.status(404).json({ message: 'Not found' });
    res.json({ book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a book (admin-only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    // optionally, delete reviews for this book
    await Review.deleteMany({ book: book._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '20')));
    const skip = (page - 1) * limit;
    
    const userBooks = await UserBook.find({ 
      user: userId, 
      isWishlisted: true 
    })
    .populate('book')
    .sort({ dateAdded: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await UserBook.countDocuments({ 
      user: userId, 
      isWishlisted: true 
    });
    
    const books = userBooks.map(ub => ({
      ...ub.book.toObject(),
      isWishlisted: true,
      readingStatus: ub.readingStatus,
      dateAdded: ub.dateAdded
    }));
    
    res.json({ page, limit, total, books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reading list
router.get('/reading', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const status = req.query.status || 'reading';
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '20')));
    const skip = (page - 1) * limit;
    
    const userBooks = await UserBook.find({ 
      user: userId, 
      readingStatus: status 
    })
    .populate('book')
    .sort({ dateStarted: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await UserBook.countDocuments({ 
      user: userId, 
      readingStatus: status 
    });
    
    const books = userBooks.map(ub => ({
      ...ub.book.toObject(),
      isWishlisted: ub.isWishlisted,
      readingStatus: ub.readingStatus,
      dateStarted: ub.dateStarted,
      dateCompleted: ub.dateCompleted
    }));
    
    res.json({ page, limit, total, books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// View book details including reviews and average rating
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    const reviews = await Review.find({ book: book._id }).populate('user', 'name');
    res.json({ book, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List reviews for a book
router.get('/:id/reviews', async (req, res) => {
  try {
    const bookId = req.params.id;
    const reviews = await Review.find({ book: bookId }).populate('user', 'name');
    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review for a book
router.post('/:id/reviews', auth, reviewCreateLimiter, async (req, res) => {
  try {
    const bookId = req.params.id;
    const { rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating 1-5 required' });
    const review = await Review.create({ book: bookId, user: req.user._id, rating, title, body });

    // Update book aggregate
    const agg = await Review.aggregate([
      { $match: { book: review.book } },
      { $group: { _id: '$book', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length) {
      await Book.findByIdAndUpdate(bookId, { averageRating: agg[0].avg, ratingsCount: agg[0].count });
    }

    res.status(201).json({ review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Remove book from wishlist
router.post('/:id/wishlist', auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    const userBook = await UserBook.findOneAndUpdate(
      { user: userId, book: bookId },
      { $set: { isWishlisted: true, dateAdded: new Date() } },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Added to wishlist', userBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id/wishlist', auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    
    await UserBook.findOneAndUpdate(
      { user: userId, book: bookId },
      { $set: { isWishlisted: false } }
    );
    
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update reading status
router.put('/:id/reading-status', auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user._id;
    const { status } = req.body;
    
    if (!['none', 'want_to_read', 'reading', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid reading status' });
    }
    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    const updateData = { readingStatus: status };
    if (status === 'reading' && !req.body.dateStarted) {
      updateData.dateStarted = new Date();
    }
    if (status === 'completed' && !req.body.dateCompleted) {
      updateData.dateCompleted = new Date();
    }
    
    const userBook = await UserBook.findOneAndUpdate(
      { user: userId, book: bookId },
      { $set: updateData },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Reading status updated', userBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
