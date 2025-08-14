const fs = require('fs');
const path = require('path');

// Helper function to read users from local file
function readUsers() {
  try {
    const usersFile = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Simple token verification (you can enhance this with JWT later)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // For now, we'll use a simple token format: "Bearer employeeCode:timestamp"
    // In production, you should use proper JWT tokens
    const tokenData = token.split(':');
    if (tokenData.length !== 2) {
      return res.status(403).json({ error: 'Invalid token format' });
    }

    const employeeCode = tokenData[0];
    const timestamp = parseInt(tokenData[1]);
    const currentTime = Date.now();
    
    // Token expires after 24 hours
    if (currentTime - timestamp > 24 * 60 * 60 * 1000) {
      return res.status(403).json({ error: 'Token expired' });
    }

    // Get user from local file
    const users = readUsers();
    const user = users.find(u => u.employeeCode === employeeCode && u.status === 'active');

    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: user.employeeCode,
      email: `${user.employeeCode}@certitude.com`,
      role: user.role || 'user',
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Role constants
const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

module.exports = {
  authenticateToken,
  requireRole,
  ROLES
}; 