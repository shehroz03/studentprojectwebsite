const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads dir
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'bsthub.db'), (err) => {
  if (err) console.error('Database error:', err.message);
  else console.log('✅ SQLite Database connected');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    deadline TEXT,
    budget REAL,
    status TEXT DEFAULT 'pending',
    attachment TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`, () => {
    db.run(`ALTER TABLE orders ADD COLUMN is_read INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN final_file TEXT`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT '$'`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN admin_budget REAL`, () => {});
  });

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT '$',
    proof_file TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`, () => {
    db.run(`ALTER TABLE payments ADD COLUMN currency TEXT DEFAULT '$'`, () => {});
  });

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT,
    file_path TEXT,
    file_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
  )`, () => {
    // Add columns if they don't exist (for existing databases)
    db.run(`ALTER TABLE messages ADD COLUMN file_path TEXT`, () => {});
    db.run(`ALTER TABLE messages ADD COLUMN file_name TEXT`, () => {});
    db.run(`ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0`, () => {});
  });

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    proof_file TEXT,
    status TEXT DEFAULT 'pending',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, () => {
    db.run(`ALTER TABLE payments ADD COLUMN is_read INTEGER DEFAULT 0`, () => {});
  });

  console.log('✅ All tables ready');

  // Auto-create default admin if not exists
  db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1', [], async (err, row) => {
    if (!row) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('12345six@', 10);
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['BST Admin', 'miansabmi7@gmail.com', hash, 'admin'],
        () => console.log('✅ Admin ready: miansabmi7@gmail.com')
      );
    }
  });
});

// ─── AUTH ───────────────────────────────────────────────────────────────

app.post('/api/auth/register.php', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

app.post('/api/auth/login.php', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

app.post('/api/auth/update-profile.php', (req, res) => {
  const { id, name, email } = req.body;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Profile updated' });
  });
});

app.post('/api/auth/change-password.php', (req, res) => {
  const { id, current_password, new_password } = req.body;
  db.get('SELECT * FROM users WHERE id = ?', [id], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(new_password, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hash, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Password changed successfully' });
    });
  });
});

// ─── ORDERS ──────────────────────────────────────────────────────────────

app.post('/api/orders/create.php', upload.single('attachment'), (req, res) => {
  const { user_id, title, service_type, description, deadline, budget, currency } = req.body;
  if (!user_id || !title || !service_type) return res.status(400).json({ error: 'Required fields missing' });

  const attachment = req.file ? req.file.filename : null;
  db.run(
    'INSERT INTO orders (user_id, title, service_type, description, deadline, budget, currency, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [user_id, title, service_type, description, deadline, budget, currency || '$', attachment],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Order created', order_id: this.lastID });
    }
  );
});

app.get('/api/orders/list.php', (req, res) => {
  const { user_id } = req.query;
  const sql = user_id ? 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC' : 'SELECT * FROM orders ORDER BY created_at DESC';
  const params = user_id ? [user_id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────

app.get('/api/admin/orders.php', (req, res) => {
  db.all(
    `SELECT orders.*, users.name as student_name, users.email as student_email 
     FROM orders LEFT JOIN users ON orders.user_id = users.id 
     ORDER BY orders.created_at DESC`,
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/admin/users.php', (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/admin/update-status.php', (req, res) => {
  const { order_id, status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, order_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.post('/api/admin/deliver.php', upload.single('final_file'), (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'Missing order_id' });
  const final_file = req.file ? req.file.filename : null;
  if (!final_file) return res.status(400).json({ error: 'No file uploaded' });

  db.get('SELECT user_id, title FROM orders WHERE id = ?', [order_id], (err, order) => {
    if (!err && order) {
      db.run('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, "order_delivered", ?, ?)',
        [order.user_id, `Your assignment for "${order.title}" has been delivered!`, order_id]);
    }
  });

  db.run('UPDATE orders SET status = "completed", final_file = ? WHERE id = ?', [final_file, order_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order delivered successfully', final_file });
  });
});

app.post('/api/admin/announce.php', (req, res) => {
  const { message } = req.body;
  db.run('INSERT INTO notifications (type, message) VALUES ("announcement", ?)', [message], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Announcement sent to all users' });
  });
});

app.post('/api/admin/send-notification.php', (req, res) => {
  const { user_id, message } = req.body;
  if (!user_id || !message) return res.status(400).json({ error: 'Missing fields' });
  
  db.run('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)', [user_id, message, 'admin_message'], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notification sent to user' });
  });
});

app.post('/api/admin/counter-offer.php', (req, res) => {
  const { order_id, admin_budget } = req.body;
  db.get('SELECT user_id, title, currency FROM orders WHERE id = ?', [order_id], (err, order) => {
    if (err || !order) return res.status(404).json({ error: 'Order not found' });
    
    db.run('UPDATE orders SET admin_budget = ? WHERE id = ?', [admin_budget, order_id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, "budget_update", ?, ?)',
        [order.user_id, `Admin has proposed a new budget of ${order.currency}${admin_budget} for "${order.title}".`, order_id]);
      res.json({ message: 'Counter-offer sent' });
    });
  });
});

app.get('/api/notifications/list.php', (req, res) => {
  const { user_id, role } = req.query;
  let sql = 'SELECT * FROM notifications WHERE (user_id = ? OR user_id IS NULL) ORDER BY created_at DESC';
  let params = [user_id];
  
  if (role === 'admin') {
    sql = 'SELECT * FROM notifications ORDER BY created_at DESC';
    params = [];
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/notifications/mark-read.php', (req, res) => {
  const { notification_id } = req.body;
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [notification_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Marked as read' });
  });
});

// ─── CHAT ─────────────────────────────────────────────────────────────────

app.get('/api/chat/messages.php', (req, res) => {
  const { user1, user2 } = req.query;
  let sql, params;

  if (user1 && user2) {
    sql = `SELECT * FROM messages 
           WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
           ORDER BY created_at ASC`;
    params = [user1, user2, user2, user1];
  } else {
    // Admin gets all messages
    sql = 'SELECT * FROM messages ORDER BY created_at ASC';
    params = [];
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/chat/send.php', upload.single('file'), (req, res) => {
  const sender_id = req.body?.sender_id;
  const receiver_id = req.body?.receiver_id;
  const message = req.body?.message || '';
  const file_path = req.file ? req.file.filename : null;
  const file_name = req.file ? req.file.originalname : null;

  console.log('Chat send:', { sender_id, receiver_id, message: message.slice(0, 30), has_file: !!file_path });

  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: 'sender_id and receiver_id are required' });
  }

  db.run(
    'INSERT INTO messages (sender_id, receiver_id, message, file_path, file_name) VALUES (?, ?, ?, ?, ?)',
    [sender_id, receiver_id, message, file_path, file_name],
    function (err) {
      if (err) {
        console.error('DB insert error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Sent', id: this.lastID });
    }
  );
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────

app.post('/api/payments/upload-proof.php', upload.single('proof'), (req, res) => {
  const { order_id, user_id, amount, currency } = req.body;
  const proof_file = req.file ? req.file.filename : null;

  db.run(
    'INSERT INTO payments (order_id, user_id, amount, currency, proof_file) VALUES (?, ?, ?, ?, ?)',
    [order_id, user_id, amount, currency || '$', proof_file],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Payment proof uploaded', id: this.lastID });
    }
  );
});

app.get('/api/payments/list.php', (req, res) => {
  const { user_id } = req.query;
  const sql = user_id 
    ? 'SELECT payments.*, users.name as student_name, users.email as student_email FROM payments LEFT JOIN users ON payments.user_id = users.id WHERE payments.user_id = ? ORDER BY payments.created_at DESC' 
    : 'SELECT payments.*, users.name as student_name, users.email as student_email FROM payments LEFT JOIN users ON payments.user_id = users.id ORDER BY payments.created_at DESC';
  const params = user_id ? [user_id] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/payments/verify.php', (req, res) => {
  const { payment_id, status } = req.body;
  db.run('UPDATE payments SET status = ? WHERE id = ?', [status, payment_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Payment status updated' });
  });
});

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
app.get('/api/notifications/unread', (req, res) => {
  const { user_id, role } = req.query;
  if (!user_id || !role) return res.status(400).json({ error: 'Missing params' });

  let chatSql, paymentsSql, ordersSql, params;

  if (role === 'admin') {
    chatSql = `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`;
    paymentsSql = `SELECT COUNT(*) as count FROM payments WHERE is_read = 0`;
    ordersSql = `SELECT COUNT(*) as count FROM orders WHERE is_read = 0`;
    params = [user_id];
  } else {
    chatSql = `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`;
    paymentsSql = `SELECT 0 as count`;
    ordersSql = `SELECT 0 as count`;
    params = [user_id];
  }

  db.get(chatSql, params, (err, chatRes) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get(paymentsSql, [], (err, payRes) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get(ordersSql, [], (err, ordRes) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          chat: chatRes ? chatRes.count : 0,
          payments: payRes ? payRes.count : 0,
          orders: ordRes ? ordRes.count : 0,
          total: (chatRes ? chatRes.count : 0) + (payRes ? payRes.count : 0) + (ordRes ? ordRes.count : 0)
        });
      });
    });
  });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const { user_id, role, type, related_id } = req.body;
  
  if (type === 'chat') {
    if (related_id) {
      db.run(`UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?`, [user_id, related_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    } else {
      db.run(`UPDATE messages SET is_read = 1 WHERE receiver_id = ?`, [user_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    }
  } else if (type === 'payments' && role === 'admin') {
    db.run(`UPDATE payments SET is_read = 1`, [], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } else if (type === 'orders' && role === 'admin') {
    db.run(`UPDATE orders SET is_read = 1`, [], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

// ─── START ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 BST HUB API running at http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (no MySQL needed)`);
  console.log(`🗂  Uploads: /uploads directory`);
  console.log(`🔗 Frontend: http://localhost:5175\n`);
});
