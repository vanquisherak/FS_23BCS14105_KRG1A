# Module 2 - Book Management

Book routes, book model, admin CRUD, wishlist and reading-list endpoints.

Included files:

- bookverse-backend/src/routes/books.js
- bookverse-backend/src/models/Book.js
- bookverse-backend/src/models/UserBook.js (if present)
- bookverse-backend/src/app.js
- bookverse-backend/package.json

How to run

1. Ensure backend dependencies are installed in `bookverse-backend/`.
2. Set `MONGODB_URI` to your MongoDB connection string and start the server.

Notes

- Some endpoints are admin-only (create/update/delete at `/books`).
- The book listing endpoint supports search and pagination via query params.
