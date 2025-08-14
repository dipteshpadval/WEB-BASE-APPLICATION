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
    mobile: '9321599541',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  const dipteshUser = {
    employeeCode: '6272',
    password: '11111111',
    name: 'diptesh',
    mobile: '9321599541',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(USERS_FILE, JSON.stringify([adminUser, dipteshUser], null, 2));
  console.log('✅ Admin and diptesh users created');
  
  // Create initial system logs
  const logsFile = path.join(__dirname, '../data/system-logs.json');
  const logsDir = path.dirname(logsFile);
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const initialLogs = [
    {
      id: Date.now().toString(),
      action: 'System initialized',
      user: 'admin@certitude.com',
      timestamp: new Date().toISOString(),
      details: 'Action: SYSTEM_INIT',
      type: 'success'
    },
    {
      id: (Date.now() + 1).toString(),
      action: 'Admin user created',
      user: 'admin@certitude.com',
      timestamp: new Date().toISOString(),
      details: 'Action: ADMIN_CREATED',
      type: 'info'
    }
  ];
  
  fs.writeFileSync(logsFile, JSON.stringify(initialLogs, null, 2));
  console.log('✅ Initial system logs created');
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

    // Generate simple token (employeeCode:timestamp)
    const token = `${user.employeeCode}:${Date.now()}`;
    
    // Log successful login
    logActivity('User login detected', `${user.employeeCode}@certitude.com`, `Action: USER_LOGIN`, 'info');

    res.json({
      token: token,
      user: {
        employeeCode: user.employeeCode,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
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
      // Log user approval
      logActivity('User approved', `${employeeCode}@certitude.com`, `Action: USER_APPROVED`, 'success');
      
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
      // Log user rejection
      logActivity('User rejected', `${employeeCode}@certitude.com`, `Action: USER_REJECTED`, 'warning');
      
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
      // Log user termination
      logActivity('User terminated', `${employeeCode}@certitude.com`, `Action: USER_TERMINATED`, 'error');
      
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
      // Log user activation
      logActivity('User activated', `${employeeCode}@certitude.com`, `Action: USER_ACTIVATED`, 'success');
      
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

// Update user details (Admin only)
router.put('/update/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const { name, mobile, password, status, role } = req.body;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    if (name) users[userIndex].name = name;
    if (mobile) users[userIndex].mobile = mobile;
    if (password) users[userIndex].password = password;
    if (status) users[userIndex].status = status;
    if (role) users[userIndex].role = role;
    
    if (writeUsers(users)) {
      // Log user update
      logActivity('User details updated', `${employeeCode}@certitude.com`, `Action: USER_UPDATED`, 'info');
      
      res.json({ 
        message: 'User updated successfully',
        user: users[userIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/delete/:employeeCode', async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow admin to delete themselves
    if (users[userIndex].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    
    if (writeUsers(users)) {
      // Log user deletion
      logActivity('User deleted', `${employeeCode}@certitude.com`, `Action: USER_DELETED`, 'error');
      
      res.json({ 
        message: 'User deleted successfully',
        user: deletedUser
      });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    const logsFile = path.join(__dirname, '../data/system-logs.json');
    
    let logs = [];
    if (fs.existsSync(logsFile)) {
      const data = fs.readFileSync(logsFile, 'utf8');
      logs = JSON.parse(data);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Get file download tracking
router.get('/downloads', async (req, res) => {
  try {
    const downloadsFile = path.join(__dirname, '../data/file-downloads.json');
    
    let downloads = [];
    if (fs.existsSync(downloadsFile)) {
      const data = fs.readFileSync(downloadsFile, 'utf8');
      downloads = JSON.parse(data);
    }
    
    // Sort by download time (newest first)
    downloads.sort((a, b) => new Date(b.downloadTime) - new Date(a.downloadTime));
    
    res.json({ downloads });
  } catch (error) {
    console.error('Get downloads error:', error);
    res.status(500).json({ error: 'Failed to get downloads' });
  }
});

// Get user file statistics
router.get('/user-stats', async (req, res) => {
  try {
    const users = readUsers();
    const fs = require('fs');
    const path = require('path');
    
    // Read file downloads data
    let fileDownloads = [];
    try {
      const downloadsPath = path.join(__dirname, '../data/file-downloads.json');
      if (fs.existsSync(downloadsPath)) {
        fileDownloads = JSON.parse(fs.readFileSync(downloadsPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading file downloads:', error);
    }
    
    // Read files data to get upload counts
    let files = [];
    try {
      const filesPath = path.join(__dirname, '../data/files.json');
      if (fs.existsSync(filesPath)) {
        files = JSON.parse(fs.readFileSync(filesPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading files:', error);
    }
    
    // Calculate stats for each user
    const userStats = users.map(user => {
      const userEmail = `${user.employeeCode}@certitude.com`;
      
      // Count downloads by this user
      const downloadCount = fileDownloads.filter(download => 
        download.user === userEmail
      ).length;
      
      // Count uploads by this user
      const uploadCount = files.filter(file => 
        (file.uploaded_by === userEmail) || 
        (file.uploadedBy === userEmail) || // Fallback for old field name
        (!file.uploaded_by && !file.uploadedBy && user.employeeCode === 'admin') // Assume admin uploaded old files
      ).length;
      
      return {
        employeeCode: user.employeeCode,
        name: user.name,
        email: userEmail,
        downloadCount,
        uploadCount,
        status: user.status,
        role: user.role
      };
    });
    
    res.json({ userStats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// Update current user profile
router.put('/profile', async (req, res) => {
  try {
    const { employeeCode, name, mobile, currentPassword, newPassword } = req.body;
    const users = readUsers();
    
    const userIndex = users.findIndex(u => u.employeeCode === employeeCode);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password if changing password
    if (newPassword && users[userIndex].password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update user details
    if (name) users[userIndex].name = name;
    if (mobile) users[userIndex].mobile = mobile;
    if (newPassword) users[userIndex].password = newPassword;
    
    if (writeUsers(users)) {
      // Log profile update
      logActivity('Profile updated', `${employeeCode}@certitude.com`, `Action: PROFILE_UPDATED`, 'info');
      
      res.json({ 
        message: 'Profile updated successfully',
        user: users[userIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get system options (file types, asset types, client codes)
router.get('/options', async (req, res) => {
  try {
    const optionsFile = path.join(__dirname, '../data/options.json');
    
    let options = {
      fileTypes: ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis'],
      assetTypes: ['Equity', 'Real Estate', 'Fixed Income', 'Commodities', 'Cash'],
      clientCodes: ['CLIENT001', 'CLIENT002', 'CLIENT003', 'CLIENT004', 'CLIENT005']
    };
    
    if (fs.existsSync(optionsFile)) {
      const data = fs.readFileSync(optionsFile, 'utf8');
      options = JSON.parse(data);
    } else {
      // Create initial options file
      fs.writeFileSync(optionsFile, JSON.stringify(options, null, 2));
    }
    
    res.json(options);
  } catch (error) {
    console.error('Get options error:', error);
    res.status(500).json({ error: 'Failed to get options' });
  }
});

// Add new option
router.post('/options/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { value } = req.body;
    
    if (!value || value.trim() === '') {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const optionsFile = path.join(__dirname, '../data/options.json');
    
    let options = {
      fileTypes: ['Holding', 'Offsite', 'Client Query', 'Value Price', 'Report', 'Analysis'],
      assetTypes: ['Equity', 'Real Estate', 'Fixed Income', 'Commodities', 'Cash'],
      clientCodes: ['CLIENT001', 'CLIENT002', 'CLIENT003', 'CLIENT004', 'CLIENT005']
    };
    
    if (fs.existsSync(optionsFile)) {
      const data = fs.readFileSync(optionsFile, 'utf8');
      options = JSON.parse(data);
    }
    
    const optionKey = type === 'fileType' ? 'fileTypes' : 
                     type === 'assetType' ? 'assetTypes' : 
                     type === 'clientCode' ? 'clientCodes' : null;
    
    if (!optionKey) {
      return res.status(400).json({ error: 'Invalid option type' });
    }
    
    if (options[optionKey].includes(value)) {
      return res.status(400).json({ error: 'Option already exists' });
    }
    
    options[optionKey].push(value);
    fs.writeFileSync(optionsFile, JSON.stringify(options, null, 2));
    
    // Log the action
    logActivity('Option added', 'admin@certitude.com', `Added ${type}: ${value}`, 'info');
    
    res.json({ 
      message: 'Option added successfully',
      options: options
    });
  } catch (error) {
    console.error('Add option error:', error);
    res.status(500).json({ error: 'Failed to add option' });
  }
});

// Delete option
router.delete('/options/:type/:value', async (req, res) => {
  try {
    const { type, value } = req.params;
    
    const optionsFile = path.join(__dirname, '../data/options.json');
    
    if (!fs.existsSync(optionsFile)) {
      return res.status(404).json({ error: 'Options file not found' });
    }
    
    const data = fs.readFileSync(optionsFile, 'utf8');
    let options = JSON.parse(data);
    
    const optionKey = type === 'fileType' ? 'fileTypes' : 
                     type === 'assetType' ? 'assetTypes' : 
                     type === 'clientCode' ? 'clientCodes' : null;
    
    if (!optionKey) {
      return res.status(400).json({ error: 'Invalid option type' });
    }
    
    const index = options[optionKey].indexOf(value);
    if (index === -1) {
      return res.status(404).json({ error: 'Option not found' });
    }
    
    options[optionKey].splice(index, 1);
    fs.writeFileSync(optionsFile, JSON.stringify(options, null, 2));
    
    // Log the action
    logActivity('Option deleted', 'admin@certitude.com', `Deleted ${type}: ${value}`, 'warning');
    
    res.json({ 
      message: 'Option deleted successfully',
      options: options
    });
  } catch (error) {
    console.error('Delete option error:', error);
    res.status(500).json({ error: 'Failed to delete option' });
  }
});

// Helper function to log system activity
function logActivity(action, user, details, type = 'info') {
  try {
    const logsFile = path.join(__dirname, '../data/system-logs.json');
    const logsDir = path.dirname(logsFile);
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    let logs = [];
    if (fs.existsSync(logsFile)) {
      const data = fs.readFileSync(logsFile, 'utf8');
      logs = JSON.parse(data);
    }
    
    const newLog = {
      id: Date.now().toString(),
      action,
      user,
      timestamp: new Date().toISOString(),
      details,
      type
    };
    
    logs.unshift(newLog);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs = logs.slice(0, 1000);
    }
    
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Helper function to log file download
function logFileDownload(filename, user, fileSize) {
  try {
    const downloadsFile = path.join(__dirname, '../data/file-downloads.json');
    const downloadsDir = path.dirname(downloadsFile);
    
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    let downloads = [];
    if (fs.existsSync(downloadsFile)) {
      const data = fs.readFileSync(downloadsFile, 'utf8');
      downloads = JSON.parse(data);
    }
    
    const newDownload = {
      id: Date.now().toString(),
      filename,
      user,
      downloadTime: new Date().toISOString(),
      fileSize
    };
    
    downloads.unshift(newDownload);
    
    // Keep only last 1000 downloads
    if (downloads.length > 1000) {
      downloads = downloads.slice(0, 1000);
    }
    
    fs.writeFileSync(downloadsFile, JSON.stringify(downloads, null, 2));
  } catch (error) {
    console.error('Error logging file download:', error);
  }
}

// Export the helper functions for use in other routes
module.exports = { router, logActivity, logFileDownload }; 