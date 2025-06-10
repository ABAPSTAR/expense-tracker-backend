const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🌟 MySQL connection using Railway credentials
const db = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'NAwLJJwuPQKsgshsJIJvGTsqiAoRwkPX',
  database: 'railway',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL as id', db.threadId);
});

// 🌟 Get all users (for testing)
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('❌ Query error:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

// 🌟 Register endpoint
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err, result) => {
      if (err) {
        console.error('❌ Insert error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({ success: true, userId: result.insertId });
    }
  );
});

// 🌟 Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE name = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (results.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Invalid credentials' });
      }
    }
  );
});

// 🌟 GET all expenses
app.get('/api/expenses', (req, res) => {
  db.query('SELECT * FROM expenses', (err, results) => {
    if (err) {
      console.error('❌ Query error:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

// 🌟 POST create a new expense
app.post('/api/expenses', (req, res) => {
  const { amount, category, date, notes } = req.body;

  db.query(
    'INSERT INTO expenses (amount, category, date, notes) VALUES (?, ?, ?, ?)',
    [amount, category, date, notes],
    (err, result) => {
      if (err) {
        console.error('❌ Insert error:', err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: '✅ Expense added', expenseId: result.insertId });
      }
    }
  );
});

// 🌟 PUT update an expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, date, notes } = req.body;

  db.query(
    'UPDATE expenses SET amount = ?, category = ?, date = ?, notes = ? WHERE id = ?',
    [amount, category, date, notes, id],
    (err) => {
      if (err) {
        console.error('❌ Update error:', err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: '✅ Expense updated' });
      }
    }
  );
});

// 🌟 DELETE an expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM expenses WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Delete error:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ message: '✅ Expense deleted' });
    }
  });
});

// 🌟 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
