const AnswerModel = require("../models/answerModel");
const { sendSuccess, sendError } = require("../utils/response");

class AnswerController {
  /**
   * Create a new answer
   */
  static async createAnswer(req, res) {
    try {
      const { content, questionId } = req.body;
      const userId = req.user.id;
      const answer = await AnswerModel.createAnswer({
        content,
        questionId,
        userId,
      });
      sendSuccess(res, 201, answer, "Answer created successfully");
    } catch (error) {
      console.error("Create answer error:", error);
      sendError(res, 500, "Failed to create answer");
    }
  }

  /**
   * Get all answers for a question
   */
  static async getAnswersByQuestionId(req, res) {
    try {
      const { id: questionId } = req.params;
      const answers = await AnswerModel.getAnswersByQuestionId(questionId);
      sendSuccess(res, 200, answers, "Answers fetched successfully");
    } catch (error) {
      console.error("Get answers error:", error);
      sendError(res, 500, "Failed to fetch answers");
    }
  }

  /**
   * Update an answer by ID (only owner)
   */
  static async updateAnswer(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const updated = await AnswerModel.updateAnswer(id, content);
      if (!updated) {
        return sendError(res, 404, "Answer not found");
      }
      sendSuccess(res, 200, updated, "Answer updated successfully");
    } catch (error) {
      console.error("Update answer error:", error);
      sendError(res, 500, "Failed to update answer");
    }
  }

  /**
   * Delete an answer by ID (only owner)
   */
  static async deleteAnswer(req, res) {
    try {
      const { id } = req.params;
      const deleted = await AnswerModel.deleteAnswer(id);
      if (!deleted) {
        return sendError(res, 404, "Answer not found");
      }
      sendSuccess(res, 200, deleted, "Answer deleted successfully");
    } catch (error) {
      console.error("Delete answer error:", error);
      sendError(res, 500, "Failed to delete answer");
    }
  }

  /**
   * Vote on an answer (upvote or downvote)
   */
  static async voteAnswer(req, res) {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = req.user.id;
      const result = await AnswerModel.voteAnswer(id, userId, voteType);
      sendSuccess(res, 200, result, "Vote registered successfully");
    } catch (error) {
      if (error.message === "Answer not found") {
        return sendError(res, 404, "Answer not found");
      }
      console.error("Vote answer error:", error);
      sendError(res, 500, "Failed to vote on answer");
    }
  }
}

module.exports = AnswerController;
