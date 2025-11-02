# Module 6 - Optional Enhancements & Search

Search, filters, pagination, and optional admin features.

Included files:

- bookverse-frontend/src/components/AdvancedSearch.jsx
- bookverse-frontend/src/pages/BooksList.jsx
- bookverse-backend/src/routes/books.js
- bookverse-frontend/package.json
- bookverse-backend/package.json

Notes

- `AdvancedSearch` drives query params used by the backend `/books` endpoint to filter by title, author, tags, and rating.
- Pagination support is implemented in `BooksList.jsx` and the backend `GET /books` route.
