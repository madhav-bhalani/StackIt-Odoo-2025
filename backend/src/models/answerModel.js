const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnswerModel {
  /**
   * Create a new answer
   * @param {Object} data
   * @param {string} data.content
   * @param {string} data.questionId
   * @param {string} data.userId
   * @returns {Promise<Object>} Created answer
   */
  static async createAnswer({ content, questionId, userId }) {
    return prisma.answer.create({
      data: {
        content,
        questionId,
        userId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Get all answers for a question
   * @param {string} questionId
   * @returns {Promise<Array>} Answers
   */
  static async getAnswersByQuestionId(questionId) {
    return prisma.answer.findMany({
      where: { questionId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Update an answer by ID
   * @param {string} id
   * @param {string} content
   * @returns {Promise<Object|null>} Updated answer or null
   */
  static async updateAnswer(id, content) {
    const answer = await prisma.answer.findUnique({ where: { id } });
    if (!answer) return null;
    return prisma.answer.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Delete an answer by ID
   * @param {string} id
   * @returns {Promise<Object|null>} Deleted answer or null
   */
  static async deleteAnswer(id) {
    const answer = await prisma.answer.findUnique({ where: { id } });
    if (!answer) return null;
    return prisma.answer.delete({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Find answer by ID
   * @param {string} id
   * @returns {Promise<Object|null>} Answer or null
   */
  static async findById(id) {
    return prisma.answer.findUnique({ where: { id } });
  }

  /**
   * Vote on an answer (upvote or downvote)
   * @param {string} answerId
   * @param {string} userId
   * @param {"UP"|"DOWN"} voteType
   * @returns {Promise<Object>} Updated vote info
   */
  static async voteAnswer(answerId, userId, voteType) {
    // Check if answer exists
    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer) throw new Error("Answer not found");
    // Upsert vote in AnswerVote
    const vote = await prisma.answerVote.upsert({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
      update: { voteType },
      create: {
        userId,
        answerId,
        voteType,
      },
    });
    // Count votes
    const upvotes = await prisma.answerVote.count({
      where: { answerId, voteType: "UP" },
    });
    const downvotes = await prisma.answerVote.count({
      where: { answerId, voteType: "DOWN" },
    });
    return {
      answerId,
      upvotes,
      downvotes,
      userVote: vote.voteType,
    };
  }
}

module.exports = AnswerModel;
