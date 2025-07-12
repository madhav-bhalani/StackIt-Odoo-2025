const UserModel = require('../models/userModel');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      const { email, firstName, lastName, password } = req.body;

      // Create user
      const user = await UserModel.createUser({
        email,
        firstName,
        lastName,
        password
      });

      // Generate JWT token
      const token = UserModel.generateToken(user);

      // Return success response
      sendSuccess(res, 201, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      }, 'User registered successfully');

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message === 'User with this email already exists') {
        return sendError(res, 409, 'User with this email already exists');
      }
      
      sendError(res, 500, 'Registration failed');
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return sendError(res, 401, 'Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 401, 'Invalid email or password');
      }

      // Generate JWT token
      const token = UserModel.generateToken(user);

      // Return success response
      sendSuccess(res, 200, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 500, 'Login failed');
    }
  }

  /**
   * Get current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;

      // Get user data
      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      // Get user statistics
      const stats = await UserModel.getUserStats(userId);

      // Return success response
      sendSuccess(res, 200, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        stats
      }, 'User data retrieved successfully');

    } catch (error) {
      console.error('Get current user error:', error);
      sendError(res, 500, 'Failed to get user data');
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;

      // Prepare update data
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;

      // Check if email is being updated and if it already exists
      if (email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return sendError(res, 409, 'Email already exists');
        }
      }

      // Update user
      const updatedUser = await UserModel.updateUser(userId, updateData);

      // Return success response
      sendSuccess(res, 200, {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }, 'Profile updated successfully');

    } catch (error) {
      console.error('Update profile error:', error);
      sendError(res, 500, 'Failed to update profile');
    }
  }

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await UserModel.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return sendError(res, 401, 'Current password is incorrect');
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await UserModel.updateUser(userId, { password: hashedNewPassword });

      // Return success response
      sendSuccess(res, 200, null, 'Password changed successfully');

    } catch (error) {
      console.error('Change password error:', error);
      sendError(res, 500, 'Failed to change password');
    }
  }

  /**
   * Logout user (client-side token removal)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token from storage
      // Optionally, you could implement a blacklist for tokens
      
      sendSuccess(res, 200, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      sendError(res, 500, 'Logout failed');
    }
  }
}

module.exports = AuthController; 