const { body } = require("express-validator");

const validateCreateQuestion = [
  body("title")
    .trim()
    .isLength({ min: 10, max: 150 })
    .withMessage("Title must be between 10 and 150 characters"),
  body("description")
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("tags")
    .isArray({ min: 1 })
    .withMessage("At least one tag is required")
    .custom(
      (tags) =>
        Array.isArray(tags) &&
        tags.length > 0 &&
        tags.every((tag) => typeof tag === "string" && tag.length > 0)
    )
    .withMessage("Tags must be a non-empty array of strings"),
];

const validateUpdateQuestion = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 10, max: 150 })
    .withMessage("Title must be between 10 and 150 characters"),
  body("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("tags")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one tag is required")
    .custom(
      (tags) =>
        Array.isArray(tags) &&
        tags.length > 0 &&
        tags.every((tag) => typeof tag === "string" && tag.length > 0)
    )
    .withMessage("Tags must be a non-empty array of strings"),
];

const validateVoteQuestion = [
  body("voteType")
    .exists()
    .withMessage("voteType is required")
    .isIn(["UP", "DOWN"])
    .withMessage("voteType must be either 'UP' or 'DOWN'"),
];

module.exports = {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateVoteQuestion,
};
