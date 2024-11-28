const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = async (username) => {
  // Example validation rules
  const minLength = 3;
  const maxLength = 20;

  // Ensure username is between 3 and 20 characters and contains only alphanumeric characters and underscores
  const regex = /^[a-zA-Z0-9_]+$/;

  if (username.length < minLength || username.length > maxLength) {
    return false; // Username length is invalid
  }

  if (!regex.test(username)) {
    return false; // Username contains invalid characters
  }

  return true; // Username is valid
};

const authenticatedUser = async (username, password) => {
  // Find user with matching username
  const user = users.find((user) => user.username === username);

  if (!user) {
    return false; // User does not exist
  }

  // Check if password matches the user's password
  if (user.password === password) {
    return true; // Authentication successful
  }

  return false; // Password is incorrect
};



//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  const isUserExist = users.find(user => user.username === username);
  if (!isUserExist) {
    return res.status(404).json({ message: "User is not exist!" });
  }

  // Generate JWT access token
  let accessToken = jwt.sign({
    username: username
  }, 'access', { expiresIn: 60 * 60 });

  // Store access token in session
  req.session.authorization = {
    accessToken
  }
  return res.status(200).send({ message: "User successfully logged in", token: accessToken });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const { isbn } = req.params; // Extract isbn ID from URL params
  const { review } = req.query; // Extract review from query
  const username = req.session.username || req.headers['username']; // Retrieve username from session

  if (!review) {
    return res.status(400).json({ message: 'Review is missing.' });
  }

  if (!username) {
    return res.status(400).json({ message: 'Username is missing.' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  // Add or update the review for the user
  book.reviews[username] = review;

  res.status(200).json({
    message: 'Review added/updated successfully.',
    book: {
      title: book.title,
      author: book.author,
      reviews: book.reviews,
    },
  });
});


// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  const { isbn } = req.params;
  const username = req.session.username || req.headers['username'];

  if (!username) {
    return res.status(400).json({ message: 'Username is missing.' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  // Add or update the review for the user
  delete book.reviews[username];

  res.status(200).json({
    message: 'Review deleted successfully.',
    book: {
      title: book.title,
      author: book.author,
      reviews: book.reviews,
    },
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
