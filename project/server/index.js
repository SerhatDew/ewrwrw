import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve static files from the dist directory

// JWT Secret
const JWT_SECRET = 'ae3f9a8b7c2d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k3'; // In production, use an environment variable

// Initialize Database
let db;

async function initializeDatabase() {
  // Open database
  db = await open({
    filename: join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      completion_percentage INTEGER NOT NULL DEFAULT 0,
      due_date DATETIME NOT NULL,
      assigned_to INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      attachment_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
    );
  `);

  // Create admin user if it doesn't exist
  const adminExists = await db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@example.com', hashedPassword, 'admin']
    );
    console.log('Admin user created');
  }
}

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based Authorization Middleware
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await db.get(
      'SELECT * FROM users WHERE email = ? OR username = ?', 
      [email, username]
    );
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'employee']
    );
    
    // Create JWT token
    const token = jwt.sign(
      { id: result.lastID, username, email, role: 'employee' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      id: result.lastID,
      username,
      email,
      role: 'employee',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.all('SELECT id, username, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/:id/role', 
  authenticateToken, 
  authorize(['admin']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['admin', 'team_lead', 'employee'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
      
      const updatedUser = await db.get(
        'SELECT id, username, email, role FROM users WHERE id = ?', 
        [id]
      );
      
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Task Routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await db.all(`
      SELECT 
        t.id, t.title, t.description, t.status, t.completion_percentage, 
        t.due_date, t.assigned_to, t.created_by, t.attachment_url, 
        t.created_at, t.updated_at,
        u1.username as assigned_username,
        u2.username as creator_username
      FROM tasks t
      JOIN users u1 ON t.assigned_to = u1.id
      JOIN users u2 ON t.created_by = u2.id
    `);
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tasks/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const tasks = await db.all(`
      SELECT 
        t.id, t.title, t.description, t.status, t.completion_percentage, 
        t.due_date, t.assigned_to, t.created_by, t.attachment_url, 
        t.created_at, t.updated_at,
        u1.username as assigned_username,
        u2.username as creator_username
      FROM tasks t
      JOIN users u1 ON t.assigned_to = u1.id
      JOIN users u2 ON t.created_by = u2.id
      WHERE t.assigned_to = ?
    `, [userId]);
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', 
  authenticateToken, 
  authorize(['admin']), 
  async (req, res) => {
    try {
      const { 
        title, description, dueDate, assignedTo, createdBy,
        status, completionPercentage, attachmentUrl 
      } = req.body;
      
      // Validate required fields
      if (!title || !description || !dueDate || !assignedTo) {
        return res.status(400).json({ message: 'Required fields missing' });
      }
      
      const result = await db.run(`
        INSERT INTO tasks 
          (title, description, status, completion_percentage, due_date, 
           assigned_to, created_by, attachment_url, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        title, 
        description, 
        status || 'pending', 
        completionPercentage || 0, 
        dueDate, 
        assignedTo, 
        createdBy || req.user.id, 
        attachmentUrl || null
      ]);
      
      const newTask = await db.get(
        'SELECT * FROM tasks WHERE id = ?', 
        [result.lastID]
      );
      
      res.status(201).json(newTask);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if task exists and get current state
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Authorization check
    const user = req.user;
    
    // Check permissions based on status change type
    if (updates.status === 'completed' && task.status !== 'completed') {
      // Marking as completed - only assigned user or admin
      if (user.id !== task.assigned_to && user.role !== 'admin') {
        return res.status(403).json({ message: 'Only assigned user or admin can mark as completed' });
      }
    } else if (['approved', 'rejected'].includes(updates.status) && task.status === 'completed') {
      // Approving/rejecting - only team lead or admin
      if (!['team_lead', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: 'Only team lead or admin can approve/reject' });
      }
    }
    
    // Prepare update fields
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(updates)) {
      // Convert camelCase to snake_case for DB fields
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updateFields.push(`${dbField} = ?`);
      updateValues.push(value);
    }
    
    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Perform update
    await db.run(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', 
  authenticateToken, 
  authorize(['admin']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if task exists
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      await db.run('DELETE FROM tasks WHERE id = ?', [id]);
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Stats Routes
app.get('/api/stats/top-performers', authenticateToken, async (req, res) => {
  try {
    // Weekly top performers
    const weeklyPerformers = await db.all(`
      SELECT 
        u.id as userId,
        u.username,
        COUNT(t.id) as tasksCompleted
      FROM users u
      JOIN tasks t ON u.id = t.assigned_to
      WHERE 
        t.status IN ('completed', 'approved') AND
        t.updated_at >= date('now', '-7 days')
      GROUP BY u.id
      ORDER BY tasksCompleted DESC
      LIMIT 10
    `);
    
    // Monthly top performers
    const monthlyPerformers = await db.all(`
      SELECT 
        u.id as userId,
        u.username,
        COUNT(t.id) as tasksCompleted
      FROM users u
      JOIN tasks t ON u.id = t.assigned_to
      WHERE 
        t.status IN ('completed', 'approved') AND
        t.updated_at >= date('now', '-30 days')
      GROUP BY u.id
      ORDER BY tasksCompleted DESC
      LIMIT 10
    `);
    
    res.json({
      weekly: weeklyPerformers,
      monthly: monthlyPerformers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Start the server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });