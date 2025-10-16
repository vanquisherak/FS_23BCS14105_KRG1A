# Module 1 - User Authentication & Management

Auth, user model, password reset, and profile endpoints.

Included files:

- bookverse-backend/src/routes/users.js
- bookverse-backend/src/models/User.js
- bookverse-backend/src/middleware/auth.js
- bookverse-backend/src/models/PasswordReset.js (if present)
- bookverse-backend/src/utils/validation.js
- bookverse-backend/src/app.js
- bookverse-backend/package.json

How to run this module locally

1. Copy the module folder into your project or run the root backend server. The backend expects a running MongoDB instance.

2. Required environment variables (see `bookverse-backend/.env`):
	- MONGODB_URI (or use the provided connection string)
	- JWT_SECRET
	- FRONTEND_URL (optional, for password reset links)

3. From the `bookverse-backend/` folder run:

	npm install
	npm start

Notes

- The auth routes use JWT Bearer tokens. The `Authorization: Bearer <token>` header is required for protected endpoints like `/users/me`.
- Passwords are hashed using bcrypt before storage.
