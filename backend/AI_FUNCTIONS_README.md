# AI Functions for StackIt Backend

This document describes the three AI functions implemented using Google AI Studio API (Gemini) for the StackIt project.

## Setup

1. **Install Dependencies**
   ```bash
   npm install @google/generative-ai
   ```

2. **Environment Variable**
   Add your Google AI API key to your `.env` file:
   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

## Available Functions

### 1. `generateAIAnswer(userQuestion)`

**Purpose**: Generates an AI-powered answer for any user question.

**Parameters**:
- `userQuestion` (string): The user's question about any topic

**Returns**: Promise<string> - AI generated response from Gemini

**Usage**:
```javascript
const { generateAIAnswer } = require('./src/services/aiService');

try {
  const answer = await generateAIAnswer("How do I implement authentication in React?");
  console.log(answer);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 2. `generateTags(userQuestion)`

**Purpose**: Generates 15 relevant tags based on a user question. The first 5 tags are the most relevant.

**Parameters**:
- `userQuestion` (string): The user's question

**Returns**: Promise<string[]> - Array of 15 tags (first 5 most relevant)

**Usage**:
```javascript
const { generateTags } = require('./src/services/aiService');

try {
  const tags = await generateTags("How do I implement authentication in React?");
  console.log('All tags:', tags);
  console.log('Most relevant (first 5):', tags.slice(0, 5));
} catch (error) {
  console.error('Error:', error.message);
}
```

### 3. `summarizeContent(content, contentType)`

**Purpose**: Summarizes content (question or answer) to make it more concise and readable.

**Parameters**:
- `content` (string): The content to summarize
- `contentType` (string): Type of content - must be either "question" or "answer"

**Returns**: Promise<string> - Summarized content

**Usage**:
```javascript
const { summarizeContent } = require('./src/services/aiService');

try {
  // Summarize a question
  const questionSummary = await summarizeContent(
    "How do I implement authentication in a React application using JWT tokens?",
    "question"
  );
  console.log('Question summary:', questionSummary);
  
  // Summarize an answer
  const answerSummary = await summarizeContent(
    "Here's a detailed explanation of JWT authentication...",
    "answer"
  );
  console.log('Answer summary:', answerSummary);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Error Handling

All functions include proper error handling and will throw descriptive errors for:
- Invalid input parameters
- API failures
- Empty responses from AI service
- Network issues

## Testing the Functions

You can test the functions using the provided example file:

```bash
node ai-example.js
```

This will demonstrate all three functions with a sample question.

## Integration with Backend Routes

Here's how you might integrate these functions into your Express routes:

```javascript
const express = require('express');
const { generateAIAnswer, generateTags, summarizeContent } = require('./src/services/aiService');

const router = express.Router();

// Route to get AI answer
router.post('/ai/answer', async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await generateAIAnswer(question);
    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to generate tags
router.post('/ai/tags', async (req, res) => {
  try {
    const { question } = req.body;
    const tags = await generateTags(question);
    res.json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to summarize content
router.post('/ai/summarize', async (req, res) => {
  try {
    const { content, contentType } = req.body;
    const summary = await summarizeContent(content, contentType);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Notes

- All functions are asynchronous and return Promises
- The functions use the `gemini-2.5-flash` model from Google AI Studio
- Input validation is included in all functions
- Error messages are descriptive and helpful for debugging
- The tag generation function ensures exactly 15 tags are returned, with the first 5 being most relevant 