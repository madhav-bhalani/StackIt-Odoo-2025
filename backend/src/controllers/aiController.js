const aiService = require("../services/aiService");
const { sendSuccess, sendError } = require("../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AIController {
  // 1. Generate AI Answer
  static async generateAIAnswer(req, res) {
    try {
      const { id: questionId } = req.params;
      // Fetch the question
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { tags: { include: { tag: true } } },
      });
      if (!question) return sendError(res, 404, "Question not found");
      const tags = question.tags.map((t) => t.tag.name);

      // Call AI service
      const aiAnswerText = await aiService.generateAIAnswer(
        question.title,
        question.description,
        tags
      );

      // Find the AI user
      const aiUser = await prisma.user.findUnique({
        where: { email: "ai@stackit.com" },
      });
      if (!aiUser) return sendError(res, 500, "AI user not found");

      // Create the answer as the AI user
      const answer = await prisma.answer.create({
        data: {
          content: aiAnswerText,
          userId: aiUser.id,
          questionId: question.id,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      return sendSuccess(res, 201, answer, "AI answer generated and posted");
    } catch (error) {
      console.error("AI answer error:", error);
      return sendError(res, 500, "Failed to generate AI answer");
    }
  }

  // 2. Auto-generate Tags
  static async autoGenerateTags(req, res) {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return sendError(res, 400, "Title and description are required");
      }
      const questionText = `${title}\n${description}`;
      const tags = await aiService.generateTags(questionText);
      return sendSuccess(res, 200, { tags }, "Tags generated successfully");
    } catch (error) {
      console.error("Auto-tag error:", error);
      return sendError(res, 500, "Failed to generate tags");
    }
  }

  // 3. Summarize Content
  static async summarizeContent(req, res) {
    try {
      const { content, contentType } = req.body;
      if (!content) {
        return sendError(res, 400, "Content is required");
      }
      const summary = await aiService.summarizeContent(
        content,
        contentType || "question"
      );
      return sendSuccess(
        res,
        200,
        { summary },
        "Content summarized successfully"
      );
    } catch (error) {
      console.error("Summarize error:", error);
      return sendError(res, 500, "Failed to summarize content");
    }
  }
}

module.exports = AIController;
