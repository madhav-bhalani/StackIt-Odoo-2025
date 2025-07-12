/**
 * Example usage of AI functions
 * This file demonstrates how to use the three AI functions
 */

require('dotenv').config();
const { generateAIAnswer, generateTags, summarizeContent } = require('./src/services/aiService');

async function demonstrateAIFunctions() {
  try {
    const sampleQuestion = "How do I implement authentication in a React application using JWT tokens?";
    
    console.log('=== AI Functions Demo ===\n');
    
    // Function 1: Generate AI Answer
    console.log('1. Generating AI Answer...');
    const aiAnswer = await generateAIAnswer(sampleQuestion);
    console.log('AI Answer:', aiAnswer);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Function 2: Generate Tags
    console.log('2. Generating Tags...');
    const tags = await generateTags(sampleQuestion);
    console.log('Generated Tags:', tags);
    console.log('First 5 (most relevant):', tags.slice(0, 5));
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Function 3: Summarize Content
    console.log('3. Summarizing Question...');
    const questionSummary = await summarizeContent(sampleQuestion, 'question');
    console.log('Question Summary:', questionSummary);
    
    console.log('\n3b. Summarizing Answer...');
    const answerSummary = await summarizeContent(aiAnswer, 'answer');
    console.log('Answer Summary:', answerSummary);
    
  } catch (error) {
    console.error('Error in demo:', error.message);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateAIFunctions();
}

module.exports = { demonstrateAIFunctions }; 