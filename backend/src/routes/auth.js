const express = require('express');
const router = express.Router();

// TODO: Import controllers when created
// const { register, login, logout, getMe } = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Register endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Login endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'Logout endpoint - Not implemented yet' });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', (req, res) => {
  res.status(501).json({ message: 'Get current user endpoint - Not implemented yet' });
});

module.exports = router; 