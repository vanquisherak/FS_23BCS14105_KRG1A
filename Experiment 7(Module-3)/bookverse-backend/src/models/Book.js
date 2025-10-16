const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  description: { type: String },
  category: { type: String },
  tags: { type: [String], default: [] },
  averageRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isCommunity: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
