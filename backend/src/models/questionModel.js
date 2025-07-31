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
   * @param {string} [options.sortBy] - Sort field (createdAt, votes)
   * @param {string} [options.order] - Sort order (asc, desc)
   * @param {boolean} [options.hasAnswers] - Filter by answered/unanswered
   * @returns {Promise<Object>} Paginated questions
   */
  static async getAllQuestions({ q, tags, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', hasAnswers }) {
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
    if (hasAnswers !== undefined) {
      if (hasAnswers === false || hasAnswers === 'false') {
        where.answers = { none: {} };
      } else if (hasAnswers === true || hasAnswers === 'true') {
        where.answers = { some: {} };
      }
    }

    // Build orderBy clause
    let orderBy = { createdAt: order };
    if (sortBy === 'votes') {
      // For vote sorting, we'll need to handle this differently
      // For now, we'll sort by createdAt and handle vote sorting in application logic
      orderBy = { createdAt: order };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tags: { include: { tag: true } },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          votes: {
            select: { userId: true, voteType: true }
          },
          answers: {
            select: { id: true, isAccepted: true }
          }
        },
      }),
      prisma.question.count({ where }),
    ]);

    // Transform questions to include vote counts and answer counts
    const transformedQuestions = questions.map(question => ({
      ...question,
      votesArray: question.votes,
      votes: question.votes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0),
      answers: question.answers.length,
      hasAcceptedAnswer: question.answers.some(answer => answer.isAccepted)
    }));

    // Sort by votes if requested
    if (sortBy === 'votes') {
      transformedQuestions.sort((a, b) => {
        return order === 'desc' ? b.votes - a.votes : a.votes - b.votes;
      });
    }

    return {
      questions: transformedQuestions,
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
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        votes: {
          select: { userId: true, voteType: true }
        },
        answers: {
          select: { id: true, isAccepted: true }
        }
      },
    });

    if (!question) return null;

    // Transform question to include vote counts and answer counts
    return {
      ...question,
      votesArray: question.votes,
      votes: question.votes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0),
      answers: question.answers.length,
      hasAcceptedAnswer: question.answers.some(answer => answer.isAccepted)
    };
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
    
    // Check if user already has a vote
    const existingVote = await prisma.questionVote.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });
    
    let userVote = null;
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // User is removing their vote (clicking same button)
        await prisma.questionVote.delete({
          where: {
            userId_questionId: {
              userId,
              questionId,
            },
          },
        });
        userVote = null;
      } else {
        // User is changing their vote
        const updatedVote = await prisma.questionVote.update({
          where: {
            userId_questionId: {
              userId,
              questionId,
            },
          },
          data: { voteType },
        });
        userVote = updatedVote.voteType;
      }
    } else {
      // User is casting a new vote
      const newVote = await prisma.questionVote.create({
        data: {
          userId,
          questionId,
          voteType,
        },
      });
      userVote = newVote.voteType;
    }
    
    // Get all votes for this question
    const allVotes = await prisma.questionVote.findMany({
      where: { questionId },
      select: { userId: true, voteType: true }
    });
    
    // Calculate vote score
    const voteScore = allVotes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0);
    
    return {
      questionId,
      votes: allVotes,
      voteScore,
      userVote,
    };
  }
}

module.exports = QuestionModel;
