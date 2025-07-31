/**
 * Test script for voting functionality
 * This can be run in the browser console to test voting
 */

// Test voting API calls
const testVoting = async () => {
  console.log('🧪 Testing Voting System...');
  
  try {
    // Check if we have a token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found. Please log in first.');
      return;
    }

    // Test question voting
    console.log('📝 Testing question voting...');
    
    // First, get a question to vote on
    const questionsResponse = await fetch('/api/questions?limit=1');
    const questionsData = await questionsResponse.json();
    
    if (!questionsData.data?.questions?.length) {
      console.error('❌ No questions found to test voting on.');
      return;
    }

    const testQuestion = questionsData.data.questions[0];
    console.log(`📋 Testing with question: "${testQuestion.title}"`);
    console.log(`📊 Current votes: ${testQuestion.votes}`);

    // Test upvote
    console.log('⬆️ Testing upvote...');
    const upvoteResponse = await fetch(`/api/questions/${testQuestion.id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ voteType: 'UP' })
    });

    if (upvoteResponse.ok) {
      const upvoteData = await upvoteResponse.json();
      console.log('✅ Upvote successful:', upvoteData);
    } else {
      const error = await upvoteResponse.text();
      console.error('❌ Upvote failed:', error);
    }

    // Test downvote
    console.log('⬇️ Testing downvote...');
    const downvoteResponse = await fetch(`/api/questions/${testQuestion.id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ voteType: 'DOWN' })
    });

    if (downvoteResponse.ok) {
      const downvoteData = await downvoteResponse.json();
      console.log('✅ Downvote successful:', downvoteData);
    } else {
      const error = await downvoteResponse.text();
      console.error('❌ Downvote failed:', error);
    }

    // Test answer voting if there are answers
    console.log('💬 Testing answer voting...');
    const answersResponse = await fetch(`/api/answers/question/${testQuestion.id}`);
    const answersData = await answersResponse.json();

    if (answersData.data?.length > 0) {
      const testAnswer = answersData.data[0];
      console.log(`📝 Testing with answer ID: ${testAnswer.id}`);
      console.log(`📊 Current answer votes: ${testAnswer.votes}`);

      // Test answer upvote
      const answerUpvoteResponse = await fetch(`/api/answers/${testAnswer.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: 'UP' })
      });

      if (answerUpvoteResponse.ok) {
        const answerUpvoteData = await answerUpvoteResponse.json();
        console.log('✅ Answer upvote successful:', answerUpvoteData);
      } else {
        const error = await answerUpvoteResponse.text();
        console.error('❌ Answer upvote failed:', error);
      }
    } else {
      console.log('ℹ️ No answers found to test voting on.');
    }

    console.log('🎉 Voting system test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Export for use in browser console
window.testVoting = testVoting;

// Also test the voting hook functionality
const testVotingHook = () => {
  console.log('🔧 Testing voting hook utilities...');
  
  // Test vote type transformation
  const testVoteTypes = ['up', 'down', 'UP', 'DOWN'];
  testVoteTypes.forEach(voteType => {
    try {
      // This would normally be imported from utils
      const transformedVoteType = voteType.toUpperCase();
      if (['UP', 'DOWN'].includes(transformedVoteType)) {
        console.log(`✅ Vote type "${voteType}" -> "${transformedVoteType}"`);
      } else {
        console.error(`❌ Invalid vote type: ${voteType}`);
      }
    } catch (error) {
      console.error(`❌ Vote type transformation failed for "${voteType}":`, error);
    }
  });

  // Test vote score calculation
  const testVotesArrays = [
    [],
    [{ userId: '1', voteType: 'UP' }],
    [{ userId: '1', voteType: 'DOWN' }],
    [
      { userId: '1', voteType: 'UP' },
      { userId: '2', voteType: 'UP' },
      { userId: '3', voteType: 'DOWN' }
    ]
  ];

  testVotesArrays.forEach((votes, index) => {
    const score = votes.reduce((score, vote) => score + (vote.voteType === 'UP' ? 1 : -1), 0);
    console.log(`✅ Vote calculation test ${index + 1}: ${votes.length} votes -> score: ${score}`);
  });

  console.log('🎉 Voting hook test completed!');
};

window.testVotingHook = testVotingHook;

console.log('🧪 Voting test functions loaded!');
console.log('Run testVoting() to test API calls');
console.log('Run testVotingHook() to test utility functions');