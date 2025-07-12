const express = require('express');
const router = express.Router();

// TODO: Import controllers when created
// const { 
//   getQuestions, 
//   getQuestion, 
//   createQuestion, 
//   updateQuestion, 
//   deleteQuestion,
//   voteQuestion 
// } = require('../controllers/questionController');

/**
 * @route   GET /api/questions
 * @desc    Get all questions with filters
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get questions endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/questions
 * @desc    Create a new question
 * @access  Private
 */
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create question endpoint - Not implemented yet' });
});

/**
 * @route   GET /api/questions/:id
 * @desc    Get question by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Get question by ID endpoint - Not implemented yet' });
});

/**
 * @route   PUT /api/questions/:id
 * @desc    Update question
 * @access  Private (owner only)
 */
router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Update question endpoint - Not implemented yet' });
});

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete question
 * @access  Private (owner only)
 */
router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Delete question endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/questions/:id/vote
 * @desc    Vote on question
 * @access  Private
 */
router.post('/:id/vote', (req, res) => {
  res.status(501).json({ message: 'Vote question endpoint - Not implemented yet' });
});

module.exports = router; 