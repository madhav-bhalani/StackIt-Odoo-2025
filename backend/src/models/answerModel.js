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
    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        userId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        votes: {
          select: { userId: true, voteType: true }
        }
      },
    });

    // Transform answer to include vote counts (will be 0 for new answer)
    return {
      ...answer,
      votesArray: answer.votes,
      votes: answer.votes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0)
    };
  }

  /**
   * Get all answers for a question
   * @param {string} questionId
   * @returns {Promise<Array>} Answers
   */
  static async getAnswersByQuestionId(questionId) {
    const answers = await prisma.answer.findMany({
      where: { questionId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        votes: {
          select: { userId: true, voteType: true }
        }
      },
    });

    // Transform answers to include vote counts
    return answers.map(answer => ({
      ...answer,
      votesArray: answer.votes,
      votes: answer.votes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0)
    }));
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
    
    // Check if user already has a vote
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
    });
    
    let userVote = null;
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // User is removing their vote (clicking same button)
        await prisma.answerVote.delete({
          where: {
            userId_answerId: {
              userId,
              answerId,
            },
          },
        });
        userVote = null;
      } else {
        // User is changing their vote
        const updatedVote = await prisma.answerVote.update({
          where: {
            userId_answerId: {
              userId,
              answerId,
            },
          },
          data: { voteType },
        });
        userVote = updatedVote.voteType;
      }
    } else {
      // User is casting a new vote
      const newVote = await prisma.answerVote.create({
        data: {
          userId,
          answerId,
          voteType,
        },
      });
      userVote = newVote.voteType;
    }
    
    // Get all votes for this answer
    const allVotes = await prisma.answerVote.findMany({
      where: { answerId },
      select: { userId: true, voteType: true }
    });
    
    // Calculate vote score
    const voteScore = allVotes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0);
    
    return {
      answerId,
      votes: allVotes,
      voteScore,
      userVote,
    };
  }

  /**
   * Accept an answer (only question owner can accept)
   * @param {string} answerId
   * @param {string} userId - User attempting to accept (must be question owner)
   * @returns {Promise<Object>} Updated answer info
   */
  static async acceptAnswer(answerId, userId) {
    // Get answer with question info to check ownership
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          select: { userId: true }
        }
      }
    });

    if (!answer) throw new Error("Answer not found");

    // Check if user is the question owner
    if (answer.question.userId !== userId) {
      throw new Error("Only question owner can accept answers");
    }

    // First, unaccept all other answers for this question
    await prisma.answer.updateMany({
      where: { 
        questionId: answer.questionId,
        id: { not: answerId }
      },
      data: { isAccepted: false }
    });

    // Accept this answer
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        votes: {
          select: { userId: true, voteType: true }
        }
      },
    });

    // Transform answer to include vote counts
    return {
      ...updatedAnswer,
      votesArray: updatedAnswer.votes,
      votes: updatedAnswer.votes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0)
    };
  }
}

module.exports = AnswerModel;
