const express = require('express');
const router = express.Router();

// TODO: Import controllers when created
// const { 
//   getAnswers, 
//   createAnswer, 
//   updateAnswer, 
//   deleteAnswer,
//   voteAnswer,
//   acceptAnswer 
// } = require('../controllers/answerController');

/**
 * @route   GET /api/answers
 * @desc    Get all answers (with filters)
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get answers endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/answers
 * @desc    Create a new answer
 * @access  Private
 */
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create answer endpoint - Not implemented yet' });
});

/**
 * @route   GET /api/answers/:id
 * @desc    Get answer by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Get answer by ID endpoint - Not implemented yet' });
});

/**
 * @route   PUT /api/answers/:id
 * @desc    Update answer
 * @access  Private (owner only)
 */
router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Update answer endpoint - Not implemented yet' });
});

/**
 * @route   DELETE /api/answers/:id
 * @desc    Delete answer
 * @access  Private (owner only)
 */
router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Delete answer endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/answers/:id/vote
 * @desc    Vote on answer
 * @access  Private
 */
router.post('/:id/vote', (req, res) => {
  res.status(501).json({ message: 'Vote answer endpoint - Not implemented yet' });
});

/**
 * @route   POST /api/answers/:id/accept
 * @desc    Accept answer (question owner only)
 * @access  Private
 */
router.post('/:id/accept', (req, res) => {
  res.status(501).json({ message: 'Accept answer endpoint - Not implemented yet' });
});

module.exports = router; 