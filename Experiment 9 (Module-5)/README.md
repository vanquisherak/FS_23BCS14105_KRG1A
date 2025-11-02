# Module 5 - Frontend UI & Routing

React pages and components for authentication, book lists, details, and review UI.

Included files:

- bookverse-frontend/src/pages/Login.jsx
- bookverse-frontend/src/pages/Register.jsx
- bookverse-frontend/src/pages/BooksList.jsx
- bookverse-frontend/src/pages/BookDetails.jsx
- bookverse-frontend/src/components/AdvancedSearch.jsx
- bookverse-frontend/src/api.js
- bookverse-frontend/package.json

How to run

1. From `bookverse-frontend/` run:

	npm install
	npm run dev

2. The frontend expects the backend base URL in `bookverse-frontend/src/api.js` (usually `/api` or full URL).

Notes

- Pages included provide routing for `/login`, `/register`, `/books`, `/books/:id`.
- Components use Axios (`api.js`) to call the backend and display book ratings and reviews.
