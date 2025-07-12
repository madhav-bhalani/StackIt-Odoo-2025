const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class QuestionModel {
  /**
   * Create a new question
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.description
   * @param {string[]} data.tags
   * @param {string} data.userId
   * @returns {Promise<Object>} Created question
   */
  static async createQuestion({ title, description, tags, userId }) {
    // Ensure tags exist or create them
    const tagRecords = await Promise.all(
      tags.map(async (tagName) => {
        return prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
      })
    );
    // Create question with tag relations
    const question = await prisma.question.create({
      data: {
        title,
        description,
        userId,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    return question;
  }

  /**
   * Get all questions with filters, search, and pagination
   * @param {Object} options
   * @param {string} [options.q] - Search query
   * @param {string[]} [options.tags] - Filter by tags
   * @param {number} [options.page] - Page number
   * @param {number} [options.limit] - Items per page
   * @returns {Promise<Object>} Paginated questions
   */
  static async getAllQuestions({ q, tags, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    // Build where clause
    const where = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags },
          },
        },
      };
    }
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          tags: { include: { tag: true } },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);
    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single question by ID
   * @param {string} id - Question ID
   * @returns {Promise<Object|null>} Question or null
   */
  static async getQuestionById(id) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * Update a question by ID
   * @param {string} id - Question ID
   * @param {Object} data - Fields to update (title, description, tags)
   * @returns {Promise<Object|null>} Updated question or null
   */
  static async updateQuestion(id, { title, description, tags }) {
    // Find the question first
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return null;
    // If tags are provided, update tag relations
    let tagConnectOrCreate = undefined;
    if (tags) {
      const tagRecords = await Promise.all(
        tags.map(async (tagName) => {
          return prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
        })
      );
      // Remove all old tags and set new ones
      await prisma.questionTag.deleteMany({ where: { questionId: id } });
      tagConnectOrCreate = tagRecords.map((tag) => ({ tagId: tag.id }));
    }
    // Update the question
    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(tagConnectOrCreate && {
          tags: { create: tagConnectOrCreate },
        }),
      },
      include: {
        tags: { include: { tag: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    return updated;
  }

  /**
   * Delete a question by ID
   * @param {string} id - Question ID
   * @returns {Promise<Object|null>} Deleted question or null
   */
  static async deleteQuestion(id) {
    // Find the question first
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return null;
    // Delete the question (cascade deletes handled by DB)
    const deleted = await prisma.question.delete({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    return deleted;
  }

  /**
   * Vote on a question (upvote or downvote)
   * @param {string} questionId
   * @param {string} userId
   * @param {"UP"|"DOWN"} voteType
   * @returns {Promise<Object>} Updated vote info
   */
  static async voteQuestion(questionId, userId, voteType) {
    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new Error("Question not found");
    // Upsert vote in QuestionVote
    const vote = await prisma.questionVote.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: { voteType },
      create: {
        userId,
        questionId,
        voteType,
      },
    });
    // Count votes
    const upvotes = await prisma.questionVote.count({
      where: { questionId, voteType: "UP" },
    });
    const downvotes = await prisma.questionVote.count({
      where: { questionId, voteType: "DOWN" },
    });
    return {
      questionId,
      upvotes,
      downvotes,
      userVote: vote.voteType,
    };
  }
}

module.exports = QuestionModel;
