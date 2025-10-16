const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  isWishlisted: { type: Boolean, default: false },
  readingStatus: { 
    type: String, 
    enum: ['none', 'want_to_read', 'reading', 'completed'], 
    default: 'none' 
  },
  rating: { type: Number, min: 1, max: 5 },
  dateAdded: { type: Date, default: Date.now },
  dateStarted: { type: Date },
  dateCompleted: { type: Date },
  notes: { type: String }
}, { 
  timestamps: true,
  indexes: [
    { user: 1, book: 1 }, // Compound index for user-book queries
    { user: 1, isWishlisted: 1 }, // For wishlist queries
    { user: 1, readingStatus: 1 } // For reading status queries
  ]
});

// Ensure one record per user-book pair
userBookSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('UserBook', userBookSchema);
