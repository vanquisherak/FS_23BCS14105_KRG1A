require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const reviewsRouter = require('./routes/reviews');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/reviews', reviewsRouter);

module.exports = app;
