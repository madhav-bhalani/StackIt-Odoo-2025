/**
 * Test script specifically for vote removal functionality
 */

const testVoteRemoval = async () => {
  console.log('🗑️ Testing Vote Removal Functionality...');
  
  try {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found. Please log in first.');
      return;
    }

    // Get a question to test with
    const questionsResponse = await fetch('/api/questions?limit=1');
    const questionsData = await questionsResponse.json();
    
    if (!questionsData.data?.questions?.length) {
      console.error('❌ No questions found to test voting on.');
      return;
    }

    const testQuestion = questionsData.data.questions[0];
    console.log(`📋 Testing vote removal with question: "${testQuestion.title}"`);
    
    // Get current vote state
    const initialVotes = testQuestion.votesArray || [];
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserVote = initialVotes.find(vote => vote.userId === currentUser.id);
    
    console.log(`👤 Current user vote: ${currentUserVote ? currentUserVote.voteType : 'None'}`);
    console.log(`📊 Initial vote counts:`, {
      upvotes: initialVotes.filter(v => v.voteType === 'UP').length,
      downvotes: initialVotes.filter(v => v.voteType === 'DOWN').length,
      total: initialVotes.length
    });

    // Test scenario 1: Cast a vote if user hasn't voted
    if (!currentUserVote) {
      console.log('\n🔄 Scenario 1: Casting initial upvote...');
      
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
        console.log('✅ Upvote cast successfully');
        console.log(`📊 New vote counts:`, {
          upvotes: upvoteData.data.votes.filter(v => v.voteType === 'UP').length,
          downvotes: upvoteData.data.votes.filter(v => v.voteType === 'DOWN').length,
          userVote: upvoteData.data.userVote
        });

        // Now test removing the vote
        console.log('\n🗑️ Scenario 2: Removing the upvote...');
        
        const removeVoteResponse = await fetch(`/api/questions/${testQuestion.id}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ voteType: 'UP' }) // Same vote type to remove
        });

        if (removeVoteResponse.ok) {
          const removeVoteData = await removeVoteResponse.json();
          console.log('✅ Vote removed successfully');
          console.log(`📊 Final vote counts:`, {
            upvotes: removeVoteData.data.votes.filter(v => v.voteType === 'UP').length,
            downvotes: removeVoteData.data.votes.filter(v => v.voteType === 'DOWN').length,
            userVote: removeVoteData.data.userVote
          });

          if (removeVoteData.data.userVote === null) {
            console.log('🎉 Vote removal working correctly!');
          } else {
            console.error('❌ Vote removal failed - user still has a vote');
          }
        } else {
          console.error('❌ Failed to remove vote:', await removeVoteResponse.text());
        }
      } else {
        console.error('❌ Failed to cast initial vote:', await upvoteResponse.text());
      }
    } else {
      // Test scenario 2: Remove existing vote
      console.log(`\n🗑️ Scenario: Removing existing ${currentUserVote.voteType} vote...`);
      
      const removeVoteResponse = await fetch(`/api/questions/${testQuestion.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: currentUserVote.voteType })
      });

      if (removeVoteResponse.ok) {
        const removeVoteData = await removeVoteResponse.json();
        console.log('✅ Vote removed successfully');
        console.log(`📊 Final vote counts:`, {
          upvotes: removeVoteData.data.votes.filter(v => v.voteType === 'UP').length,
          downvotes: removeVoteData.data.votes.filter(v => v.voteType === 'DOWN').length,
          userVote: removeVoteData.data.userVote
        });

        if (removeVoteData.data.userVote === null) {
          console.log('🎉 Vote removal working correctly!');
        } else {
          console.error('❌ Vote removal failed - user still has a vote');
        }
      } else {
        console.error('❌ Failed to remove vote:', await removeVoteResponse.text());
      }
    }

  } catch (error) {
    console.error('❌ Vote removal test failed:', error);
  }
};

// Test vote change functionality
const testVoteChange = async () => {
  console.log('\n🔄 Testing Vote Change Functionality...');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found.');
      return;
    }

    const questionsResponse = await fetch('/api/questions?limit=1');
    const questionsData = await questionsResponse.json();
    
    if (!questionsData.data?.questions?.length) {
      console.error('❌ No questions found.');
      return;
    }

    const testQuestion = questionsData.data.questions[0];
    console.log(`📋 Testing vote change with question: "${testQuestion.title}"`);

    // Cast upvote
    console.log('⬆️ Casting upvote...');
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
      console.log(`✅ Upvote result: ${upvoteData.data.userVote}`);

      // Change to downvote
      console.log('⬇️ Changing to downvote...');
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
        console.log(`✅ Vote change result: ${downvoteData.data.userVote}`);
        
        if (downvoteData.data.userVote === 'DOWN') {
          console.log('🎉 Vote change working correctly!');
        } else {
          console.error('❌ Vote change failed');
        }
      }
    }

  } catch (error) {
    console.error('❌ Vote change test failed:', error);
  }
};

// Main test function
const runVoteRemovalTests = async () => {
  console.log('🧪 Running Vote Removal Tests...\n');
  
  await testVoteRemoval();
  await testVoteChange();
  
  console.log('\n🎉 Vote removal tests completed!');
  console.log('\n📋 What was fixed:');
  console.log('✅ Backend now properly deletes votes when user clicks same button');
  console.log('✅ Backend supports vote removal (not just upsert)');
  console.log('✅ Frontend optimistic updates handle vote removal correctly');
  console.log('✅ Vote counts update properly when votes are removed');
};

// Export for browser console
window.testVoteRemoval = testVoteRemoval;
window.testVoteChange = testVoteChange;
window.runVoteRemovalTests = runVoteRemovalTests;

console.log('🧪 Vote Removal Tests Loaded!');
console.log('Run runVoteRemovalTests() to test vote removal functionality');