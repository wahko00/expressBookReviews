const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Filter the users array to find if the username already exists
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if at least one user is found, false otherwise
    return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array to find a match for both username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if a matching user is found, false otherwise
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT Access Token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store the token in the session
        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let review = req.query.review;
  let username = req.session.authorization['username'];

  if (books[isbn]) {
      let book = books[isbn];
      book.reviews[username] = review;
      
      // Message ရော၊ လက်ရှိ book ရဲ့ reviews list ရောကို JSON format နဲ့ ပြန်ပေးရပါမယ်
      return res.status(200).json({ 
          message: `The review for the book with ISBN ${isbn} has been added/updated.`,
          reviews: book.reviews 
      });
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    if (books[isbn]) {
        let book = books[isbn];
        if (book.reviews[username]) {
            delete book.reviews[username];
            // string message အစား JSON object နဲ့ ပြန်ပေးပါ
            return res.status(200).json({ message: `Review for ISBN ${isbn} deleted` });
        } else {
            return res.status(404).json({ message: "No review found" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
