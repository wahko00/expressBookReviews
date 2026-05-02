const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if user already exists
    const userExists = users.some((user) => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists!" });
    }
  
    // Add the new user to the shared 'users' array
    users.push({ "username": username, "password": password });
    
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Simulate an asynchronous operation to fetch books
        const getBooks = new Promise((resolve, reject) => {
            resolve(books);
        });

        const bookList = await getBooks;
        res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
  
    try {
      const getBook = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject("Book not found");
        }
      });
  
      const result = await getBook;
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({ message: error });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      const getBooksByAuthor = new Promise((resolve, reject) => {
        const allBooks = Object.values(books);
        const filteredBooks = allBooks.filter(book => book.author === author);
  
        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject("No books found for this author");
        }
      });
  
      const result = await getBooksByAuthor;
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({ message: error });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
      const getBooksByTitle = new Promise((resolve, reject) => {
        const allBooks = Object.values(books);
        const filteredBooks = allBooks.filter(book => book.title === title);
  
        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject("No books found with this title");
        }
      });
  
      const result = await getBooksByTitle;
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({ message: error });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      // Return only the reviews part of the book object
      return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
