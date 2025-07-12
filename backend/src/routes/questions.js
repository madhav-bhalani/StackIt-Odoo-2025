const express = require("express");
const router = express.Router();

const QuestionController = require("../controllers/questionController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { validateCreateQuestion } = require("../middleware/questionValidation");
const { validateUpdateQuestion } = require("../middleware/questionValidation");
const { validateVoteQuestion } = require("../middleware/questionValidation");
const { authorizeOwner } = require("../middleware/auth");

/**
 * @route   GET /api/questions
 * @desc    Get all questions with filters
 * @access  Public
 */
router.get("/", QuestionController.getAllQuestions);

/**
 * @route   POST /api/questions
 * @desc    Create a new question
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validateCreateQuestion,
  validate,
  QuestionController.createQuestion
);

/**
 * @route   GET /api/questions/:id
 * @desc    Get question by ID
 * @access  Public
 */
router.get("/:id", QuestionController.getQuestionById);

/**
 * @route   PUT /api/questions/:id
 * @desc    Update question
 * @access  Private (owner only)
 */
router.put(
  "/:id",
  authenticate,
  authorizeOwner(async (req) => {
    // Get the question's ownerId
    const question = await require("../models/questionModel").getQuestionById(
      req.params.id
    );
    return question ? question.userId : null;
  }),
  validateUpdateQuestion,
  validate,
  QuestionController.updateQuestion
);

/**
 * @route   DELETE /api/questions/:id
 * @desc    Delete question
 * @access  Private (owner only)
 */
router.delete(
  "/:id",
  authenticate,
  authorizeOwner(async (req) => {
    // Get the question's ownerId
    const question = await require("../models/questionModel").getQuestionById(
      req.params.id
    );
    return question ? question.userId : null;
  }),
  QuestionController.deleteQuestion
);

/**
 * @route   POST /api/questions/:id/vote
 * @desc    Vote on question
 * @access  Private
 */
router.post(
  "/:id/vote",
  authenticate,
  validateVoteQuestion,
  validate,
  QuestionController.voteQuestion
);

module.exports = router;
