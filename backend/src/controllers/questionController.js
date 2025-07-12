const QuestionModel = require("../models/questionModel");
const { sendSuccess, sendError } = require("../utils/response");

class QuestionController {
  /**
   * Create a new question
   */
  static async createQuestion(req, res) {
    try {
      const { title, description, tags } = req.body;
      const userId = req.user.id;
      const question = await QuestionModel.createQuestion({
        title,
        description,
        tags,
        userId,
      });
      sendSuccess(res, 201, question, "Question created successfully");
    } catch (error) {
      console.error("Create question error:", error);
      sendError(res, 500, "Failed to create question");
    }
  }

  /**
   * Get all questions with filters, search, and pagination
   */
  static async getAllQuestions(req, res) {
    try {
      const { q, tags, page = 1, limit = 10 } = req.query;
      const tagArr = tags
        ? Array.isArray(tags)
          ? tags
          : tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
        : [];
      const result = await QuestionModel.getAllQuestions({
        q,
        tags: tagArr,
        page: Number(page),
        limit: Number(limit),
      });
      sendSuccess(res, 200, result, "Questions fetched successfully");
    } catch (error) {
      console.error("Get all questions error:", error);
      sendError(res, 500, "Failed to fetch questions");
    }
  }

  /**
   * Get a single question by ID
   */
  static async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await QuestionModel.getQuestionById(id);
      if (!question) {
        return sendError(res, 404, "Question not found");
      }
      sendSuccess(res, 200, question, "Question fetched successfully");
    } catch (error) {
      console.error("Get question by ID error:", error);
      sendError(res, 500, "Failed to fetch question");
    }
  }

  /**
   * Update a question by ID
   */
  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const { title, description, tags } = req.body;
      const updated = await QuestionModel.updateQuestion(id, {
        title,
        description,
        tags,
      });
      if (!updated) {
        return sendError(res, 404, "Question not found");
      }
      sendSuccess(res, 200, updated, "Question updated successfully");
    } catch (error) {
      console.error("Update question error:", error);
      sendError(res, 500, "Failed to update question");
    }
  }

  /**
   * Delete a question by ID
   */
  static async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const deleted = await QuestionModel.deleteQuestion(id);
      if (!deleted) {
        return sendError(res, 404, "Question not found");
      }
      sendSuccess(res, 200, deleted, "Question deleted successfully");
    } catch (error) {
      console.error("Delete question error:", error);
      sendError(res, 500, "Failed to delete question");
    }
  }

  /**
   * Vote on a question (upvote or downvote)
   */
  static async voteQuestion(req, res) {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = req.user.id;
      const result = await QuestionModel.voteQuestion(id, userId, voteType);
      sendSuccess(res, 200, result, "Vote registered successfully");
    } catch (error) {
      if (error.message === "Question not found") {
        return sendError(res, 404, "Question not found");
      }
      console.error("Vote question error:", error);
      sendError(res, 500, "Failed to vote on question");
    }
  }
}

module.exports = QuestionController;
