const express = require("express");
const router = express.Router();
const AIController = require("../controllers/aiController");
const { authenticate } = require("../middleware/auth");
const { authorizeOwner } = require("../middleware/auth");

// 1. Generate AI Answer (question owner only)
router.post(
  "/questions/:id/answer",
  authenticate,
  authorizeOwner(async (req) => {
    const question = await require("../models/questionModel").getQuestionById(
      req.params.id
    );
    return question ? question.userId : null;
  }),
  AIController.generateAIAnswer
);

// 2. Auto-generate Tags (any authenticated user)
router.post(
  "/questions/auto-tags",
  authenticate,
  AIController.autoGenerateTags
);

// 3. Summarize Content (any authenticated user)
router.post("/content/summarize", authenticate, AIController.summarizeContent);

module.exports = router;
