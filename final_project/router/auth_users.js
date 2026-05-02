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
    let review = req.query.review; // Retrieve the review from query parameters
    let sessionData = req.session.authorization;
  
    if (sessionData) {
        let username = sessionData['username']; // Get the username from the session
        
        // Check if the book exists in the books data
        if (books[isbn]) {
            let book = books[isbn];
            // Set the review for the specific user (adds new or overwrites existing)
            book.reviews[username] = review;
            return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
        } else {
            return res.status(404).json({message: "Book not found"});
        }
    } else {
        return res.status(403).json({message: "User not logged in"});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    if (books[isbn]) {
        let book = books[isbn];
        
        // Check if the user has a review for this book
        if (book.reviews[username]) {
            // Delete the review associated with the session username
            delete book.reviews[username];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
        } else {
            return res.status(404).json({ message: "No review found for this user on this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
