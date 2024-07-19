const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();  // For loading environment variables

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database('database.db');

// Create Users table
db.run(`CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS Note (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  title TEXT,
  content TEXT,
  tags TEXT,
  color TEXT,
  isArchived BOOLEAN,
  isTrashed BOOLEAN,
  deletedAt DATE,
  createdAt DATE DEFAULT CURRENT_TIMESTAMP,
  reminder DATE,
  FOREIGN KEY (userId) REFERENCES Users (id)
)`);

// Get the secret key from environment variables
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// Signup endpoint
app.post('/api/users/signup', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM Users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error('Error selecting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (row) {
      return res.status(400).json({ error: 'User already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO Users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          const token = jwt.sign({ id: this.lastID }, secretKey, { expiresIn: '1h' });
          res.status(201).json({ message: 'User created successfully', token });
        }
      );
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Signin endpoint
app.post('/api/users/signin', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM Users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      console.error('Error selecting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, row.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: row.id }, secretKey, { expiresIn: '1h' });
      res.status(200).json({ message: 'User signed in successfully', token });
    } catch (error) {
      console.error('Error comparing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Token missing");
    return res.status(403).send("Token is required");
  }

  try {
    console.log("Token received:", token);
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).send("Invalid Token");
  }
};

// Create Note
app.post("/api/notes", verifyToken, (req, res) => {
  const { title, content, tags, color, reminder } = req.body;

  db.run(
    `INSERT INTO Note (userId, title, content, tags, color, isArchived, isTrashed, reminder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, title, content, tags.join(','), color, false, false, reminder],
    function (err) {
      if (err) {
        console.error('Error creating note:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ message: "Note Created" });
    }
  );
});


// Get Notes
app.get("/api/notes", verifyToken, (req, res) => {
  db.all('SELECT * FROM Note WHERE userId = ? AND isTrashed = 0', [req.userId], (err, rows) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(rows);
  });
});

// Search Notes
app.get("/api/notes/search", verifyToken, (req, res) => {
  const { query } = req.query;
  db.all(
    `SELECT * FROM Note WHERE userId = ? AND isTrashed = 0 AND (title LIKE ? OR content LIKE ?)`,
    [req.userId, `%${query}%`, `%${query}%`],
    (err, rows) => {
      if (err) {
        console.error('Error searching notes:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json(rows);
    }
  );
});

// Get Archived Notes
app.get("/api/notes/archived", verifyToken, (req, res) => {
  db.all('SELECT * FROM Note WHERE userId = ? AND isArchived = 1', [req.userId], (err, rows) => {
    if (err) {
      console.error('Error fetching archived notes:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(rows);
  });
});

// Get Notes by Tag
app.get("/api/notes/tag/:tag", verifyToken, (req, res) => {
  const { tag } = req.params;
  db.all(
    'SELECT * FROM Note WHERE userId = ? AND tags LIKE ? AND isTrashed = 0',
    [req.userId, `%${tag}%`],
    (err, rows) => {
      if (err) {
        console.error('Error fetching notes by tag:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json(rows);
    }
  );
});

// Get Trashed Notes
app.get("/api/notes/trashed", verifyToken, (req, res) => {
  db.all('SELECT * FROM Note WHERE userId = ? AND isTrashed = 1', [req.userId], (err, rows) => {
    if (err) {
      console.error('Error fetching trashed notes:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(rows);
  });
});

// Update Note
app.put("/api/notes/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { isArchived } = req.body;

  if (typeof isArchived !== "boolean") {
    return res.status(400).json({ error: "Invalid input" });
  }

  db.run(
    'UPDATE Note SET isArchived = ? WHERE id = ? AND userId = ?',
    [isArchived ? 1 : 0, id, req.userId],
    function(err) {
      if (err) {
        console.error('Error updating note:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.status(200).json({ message: 'Note updated successfully' });
    }
  );
});




// Move Note to Trash
app.delete("/api/notes/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE Note SET isTrashed = 1, deletedAt = ? WHERE id = ? AND userId = ?`,
    [new Date().toISOString(), id, req.userId],
    function (err) {
      if (err) {
        console.error('Error moving note to trash:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (this.changes === 0) {
        return res.status(404).send("Note not found");
      }
      res.status(200).send("Note Moved to Trash");
    }
  );
});

// Empty Trash
app.delete("/api/notes/trashed/empty", verifyToken, (req, res) => {
  db.run('DELETE FROM Note WHERE userId = ? AND isTrashed = 1', [req.userId], (err) => {
    if (err) {
      console.error('Error emptying trash:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).send("Trash Emptied");
  });
});

// Reminder Notes
app.get("/api/notes/reminders", verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM Note WHERE userId = ? AND reminder >= ? AND isTrashed = 0`,
    [req.userId, new Date().toISOString()],
    (err, rows) => {
      if (err) {
        console.error('Error fetching reminder notes:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json(rows);
    }
  );
});

// Schedule a Job to Delete Notes in Trash for More Than 30 Days
cron.schedule("0 0 * * *", () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  db.run(
    'DELETE FROM Note WHERE isTrashed = 1 AND deletedAt <= ?',
    [thirtyDaysAgo.toISOString()],
    (err) => {
      if (err) {
        console.error('Error deleting old trashed notes:', err);
      } else {
        console.log("Deleted notes in trash for more than 30 days");
      }
    }
  );
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
