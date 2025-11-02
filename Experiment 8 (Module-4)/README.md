# Module 4 - Rating & Aggregation

Stores and computes aggregate ratings per book.

Included files:

- bookverse-backend/src/models/Book.js
- bookverse-backend/src/models/Review.js
- bookverse-backend/src/routes/books.js
- bookverse-backend/src/routes/reviews.js
- bookverse-backend/package.json

Details

- The `Book` model has `averageRating` and `ratingsCount` fields.
- After any review mutation, the APIs recalculate aggregates using an aggregation pipeline and update the book document.
