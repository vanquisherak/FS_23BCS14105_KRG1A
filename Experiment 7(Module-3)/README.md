# Module 3 - Review Management

Review endpoints, review model, and aggregate updates that recalculate book ratings.

Included files:

- bookverse-backend/src/routes/reviews.js
- bookverse-backend/src/models/Review.js
- bookverse-backend/src/models/Book.js
- bookverse-backend/src/app.js
- bookverse-backend/package.json

How to run & test

1. Start the backend with a MongoDB URI configured.
2. Endpoints:
	- `POST /books/:id/reviews` - add review (auth required)
	- `PUT /reviews/:id` - edit own review
	- `DELETE /reviews/:id` - delete review (owner/admin)

Notes

- Each review stores a numeric rating (1-5). After create/update/delete the Book's `averageRating` and `ratingsCount` are recalculated.
