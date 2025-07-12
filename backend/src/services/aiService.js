/**
 * AI Service for StackIt
 * This service integrates with Google AI Studio API (Gemini) for AI-powered features
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Function 1: Generate AI answer for a user question
 * @param {string} userQuestion - The user's question about any topic
 * @returns {Promise<string>} AI generated response from Gemini
 */
const generateAIAnswer = async (userQuestion) => {
  try {
    if (!userQuestion || typeof userQuestion !== 'string') {
      throw new Error('Invalid question: must be a non-empty string');
    }

    // Create the model instance
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the prompt with the user's question
    const prompt = `You are a helpful AI assistant. Please provide a comprehensive and accurate answer to the following question. Make sure your response is well-structured, informative, and helpful.

Question: ${userQuestion}

Please provide a detailed answer:`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    return text.trim();
  } catch (error) {
    console.error('Error generating AI answer:', error);
    throw new Error(`Failed to generate AI answer: ${error.message}`);
  }
};

/**
 * Function 2: Generate 15 tags based on user question
 * @param {string} userQuestion - The user's question
 * @returns {Promise<string[]>} Array of 15 tags (first 5 most relevant)
 */
const generateTags = async (userQuestion) => {
  try {
    if (!userQuestion || typeof userQuestion !== 'string') {
      throw new Error('Invalid question: must be a non-empty string');
    }

    // Create the model instance
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the prompt for tag generation
    const prompt = `Based on the following question, generate exactly 15 relevant tags. The first 5 tags should be the most relevant and important for this question. Return only the tags separated by commas, no additional text or formatting.

Question: ${userQuestion}

Tags:`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    // Parse and clean the tags
    const tags = text
      .trim()
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 15); // Ensure we only get 15 tags

    if (tags.length === 0) {
      throw new Error('No valid tags generated');
    }

    return tags;
  } catch (error) {
    console.error('Error generating tags:', error);
    throw new Error(`Failed to generate tags: ${error.message}`);
  }
};

/**
 * Function 3: Summarize content (question or answer)
 * @param {string} content - The content to summarize
 * @param {string} contentType - Type of content ('question' or 'answer')
 * @returns {Promise<string>} Summarized content
 */
const summarizeContent = async (content, contentType = 'question') => {
  try {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }

    if (!['question', 'answer'].includes(contentType)) {
      throw new Error('Invalid content type: must be "question" or "answer"');
    }

    // Create the model instance
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the prompt for summarization
    const prompt = `Please provide a clear and concise summary of the following ${contentType}. The summary should capture the main points and key information while being easy to understand.

${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${content}

Summary:`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    return text.trim();
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw new Error(`Failed to summarize content: ${error.message}`);
  }
};

/**
 * Helper function to validate AI response
 * @param {string} response - AI response to validate
 * @returns {boolean} Whether response is valid
 */
const validateAIResponse = (response) => {
  if (!response || typeof response !== 'string') {
    return false;
  }
  
  if (response.length < 10) {
    return false;
  }
  
  if (response.length > 10000) {
    return false;
  }
  
  return true;
};

/**
 * Helper function to check AI rate limit
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Whether request is allowed
 */
const checkAIRateLimit = async (userId) => {
  try {
    // TODO: Implement rate limiting logic
    // This could use Redis or database to track request counts
    
    // For now, allow all requests
    return true;
  } catch (error) {
    console.error('Error checking AI rate limit:', error);
    return false;
  }
};

/**
 * Helper function to log AI operation for monitoring
 * @param {string} operation - Type of AI operation
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata
 */
const logAIOperation = async (operation, userId, metadata = {}) => {
  try {
    // TODO: Implement logging logic
    // This could log to database, external service, etc.
    
    console.log(`AI Operation: ${operation}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  } catch (error) {
    console.error('Error logging AI operation:', error);
  }
};

module.exports = {
  generateAIAnswer,
  generateTags,
  summarizeContent,
  validateAIResponse,
  checkAIRateLimit,
  logAIOperation
}; 