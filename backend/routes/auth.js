const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// File path for storing users
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file with admin user if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  const adminUser = {
    employeeCode: 'admin',
    password: '12345678',
    name: 'Administrator',
    mobile: '1234567890',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(USERS_FILE, JSON.stringify([adminUser], null, 2));
  console.log('✅ Admin user created');
}

// Helper function to read users
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Helper function to write users
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

// Register new user
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('employeeCode').notEmpty().withMessage('Employee code is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, mobile, employeeCode, password } = req.body;
    const users = readUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.employeeCode === employeeCode);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this employee code already exists' });
    }

    // Create new user (pending approval) with password
    const newUser = {
      employeeCode,
      password, // Store the password
      name,
      mobile,
      role: 'user',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    
    if (writeUsers(users)) {
      res.status(201).json({
        message: 'Registration successful. Please wait for admin approval.',
        user: {
          employeeCode: newUser.employeeCode,
          name: newUser.name,
          status: newUser.status
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to save user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('employeeCode').notEmpty().withMessage('Employee code is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeCode, password } = req.body;
    const users = readUsers();

    // Find user
    const user = users.find(u => u.employeeCode === employeeCode);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check password for existing users
    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if user is approved
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not approved. Please contact administrator.' });
    }

    res.json({
      user: {
        employeeCode: user.employeeCode,
        name: user.name,
        role: user.role,
        status: user.status
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = readUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Approve user (Admin only)
router.post('/approve/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].status = 'active';
    
    if (writeUsers(users)) {
      res.json({ 
        message: 'User approved successfully',
        user: users[userIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject user (Admin only)
router.post('/reject/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].status = 'rejected';
    
    if (writeUsers(users)) {
      res.json({ 
        message: 'User rejected successfully',
        user: users[userIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// Terminate user (Admin only)
router.post('/terminate/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].status = 'terminated';
    
    if (writeUsers(users)) {
      res.json({ 
        message: 'User terminated successfully',
        user: users[userIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Terminate user error:', error);
    res.status(500).json({ error: 'Failed to terminate user' });
  }
});

// Activate user (Admin only)
router.post('/activate/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].status = 'active';
    
    if (writeUsers(users)) {
      res.json({ 
        message: 'User activated successfully',
        user: users[userIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Get system stats
router.get('/stats', async (req, res) => {
  try {
    const users = readUsers();
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      pendingUsers: users.filter(u => u.status === 'pending').length,
      terminatedUsers: users.filter(u => u.status === 'terminated').length,
      adminUsers: users.filter(u => u.role === 'admin').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router; 