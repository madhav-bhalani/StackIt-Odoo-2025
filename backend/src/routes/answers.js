const express = require("express");
const router = express.Router();

const AnswerController = require("../controllers/answerController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { authorizeOwner } = require("../middleware/auth");
const { body } = require("express-validator");

// Create answer
router.post(
  "/",
  authenticate,
  [
    body("content").isLength({ min: 2 }).withMessage("Content is required"),
    body("questionId")
      .isString()
      .notEmpty()
      .withMessage("questionId is required"),
  ],
  validate,
  AnswerController.createAnswer
);

// Get answers for a question
router.get("/question/:id", AnswerController.getAnswersByQuestionId);

// Update answer (only owner)
router.put(
  "/:id",
  authenticate,
  authorizeOwner(async (req) => {
    const answer =
      (await require("../models/answerModel").findById?.(req.params.id)) ||
      (await require("../prisma/client").answer.findUnique({
        where: { id: req.params.id },
      }));
    return answer ? answer.userId : null;
  }),
  [body("content").isLength({ min: 2 }).withMessage("Content is required")],
  validate,
  AnswerController.updateAnswer
);

// Delete answer (only owner)
router.delete(
  "/:id",
  authenticate,
  authorizeOwner(async (req) => {
    const answer =
      (await require("../models/answerModel").findById?.(req.params.id)) ||
      (await require("../prisma/client").answer.findUnique({
        where: { id: req.params.id },
      }));
    return answer ? answer.userId : null;
  }),
  AnswerController.deleteAnswer
);

// Vote on answer
router.post(
  "/:id/vote",
  authenticate,
  [
    body("voteType")
      .exists()
      .isIn(["UP", "DOWN"])
      .withMessage("voteType must be 'UP' or 'DOWN'"),
  ],
  validate,
  AnswerController.voteAnswer
);

module.exports = router;
