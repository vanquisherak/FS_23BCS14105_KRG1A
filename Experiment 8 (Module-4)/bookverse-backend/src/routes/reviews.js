const express = require('express');
const rateLimit = require('express-rate-limit');
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

const reviewMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many review updates. Please slow down.' }
});

router.get('/recent', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(12, parseInt(req.query.limit || '5', 10)));
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .populate('book', 'title author');

    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit a review (only owner)
router.put('/:id', auth, reviewMutationLimiter, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const { rating, title, body } = req.body;
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (body) review.body = body;
    await review.save();

    // Recompute aggregates
    const agg = await Review.aggregate([
      { $match: { book: review.book } },
      { $group: { _id: '$book', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length) {
      await Book.findByIdAndUpdate(review.book, { averageRating: agg[0].avg, ratingsCount: agg[0].count });
    }

    res.json({ review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review (owner or admin)
router.delete('/:id', auth, reviewMutationLimiter, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const bookId = review.book;
    await Review.deleteOne({ _id: review._id });

    // Recompute aggregates
    const agg = await Review.aggregate([
      { $match: { book: bookId } },
      { $group: { _id: '$book', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length) {
      await Book.findByIdAndUpdate(bookId, { averageRating: agg[0].avg, ratingsCount: agg[0].count });
    } else {
      await Book.findByIdAndUpdate(bookId, { averageRating: 0, ratingsCount: 0 });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
