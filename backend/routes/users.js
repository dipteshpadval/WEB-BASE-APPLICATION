const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { authenticateToken, requireRole, ROLES } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', 
  authenticateToken,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Error fetching users' });
      }

      res.json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Update user role (Admin only)
router.patch('/:id/role',
  authenticateToken,
  requireRole([ROLES.ADMIN]),
  [
    body('role').isIn(['admin', 'uploader', 'viewer'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { role } = req.body;

      // Prevent admin from changing their own role
      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot change your own role' });
      }

      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id)
        .select('id, email, role')
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error updating user role' });
      }

      if (!data) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User role updated successfully',
        user: data
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

// Delete user (Admin only)
router.delete('/:id',
  authenticateToken,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Error deleting user' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

// Get user profile
router.get('/profile',
  authenticateToken,
  async (req, res) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .eq('id', req.user.id)
        .single();

      if (error) {
        return res.status(500).json({ error: 'Error fetching profile' });
      }

      res.json({ profile });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

module.exports = router; 