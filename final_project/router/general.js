const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).json({ message: "Bad Request!" });
  }

  const isUserExist = users.find(user => user.username === username);
  if (isUserExist) {
    res.status(200).json({ message: "User already exists!" });
  }

  users.push(req.body);

  return res.status(200).json({ message: "User added successfully!" });
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  return res.status(200).json(books);
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;

    // Return the book details as a Promise
    const bookDetails = await new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    });

    // If successful, return the book details
    return res.status(200).json(bookDetails);

  } catch (error) {
    // Handle error if book not found or any other issue
    return res.status(404).json({ error: error.message });
  }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Use Promise to simulate asynchronous behavior
    const book = await new Promise((resolve, reject) => {
      const foundBook = Object.values(books).find(b => b.author.toLowerCase() === author.toLowerCase());
      if (foundBook) {
        resolve(foundBook);
      } else {
        reject(new Error('Book by this author not found.'));
      }
    });

    // If the promise resolves, send the book data
    return res.status(200).json(book);

  } catch (error) {
    // If promise is rejected, return error message
    return res.status(404).json({ message: error.message });
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    // Use Promise to simulate asynchronous behavior
    const book = await new Promise((resolve, reject) => {
      const foundBook = Object.values(books).find(b => b.title.toLowerCase() === title.toLowerCase());
      if (foundBook) {
        resolve(foundBook);
      } else {
        reject(new Error('Book with this title not found.'));
      }
    });

    // If the promise resolves, return the book details
    return res.status(200).json(book);

  } catch (error) {
    // If the promise is rejected, return the error message
    return res.status(404).json({ message: error.message });
  }
});


//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const reviews = books[req.params.isbn].reviews;
  return res.status(200).json(reviews);
});


module.exports.general = public_users;
