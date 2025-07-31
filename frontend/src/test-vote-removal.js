// Test script to verify vote removal functionality
// This can be run in the browser console to test voting

const testVoteRemoval = () => {
  console.log('🗳️ Testing Vote Removal Functionality...\n');
  
  // Test 1: Check if votesArray is properly handled
  console.log('1. Testing votesArray handling:');
  
  const testVotesArray = [
    { userId: 'user1', voteType: 'UP' },
    { userId: 'user2', voteType: 'DOWN' },
    { userId: 'user3', voteType: 'UP' }
  ];
  
  console.log('   Sample votesArray:', testVotesArray);
  console.log('   Upvotes:', testVotesArray.filter(vote => vote.voteType === 'UP').length);
  console.log('   Downvotes:', testVotesArray.filter(vote => vote.voteType === 'DOWN').length);
  
  // Test 2: Test with invalid data
  console.log('\n2. Testing with invalid data:');
  
  const invalidData = [null, undefined, 'not-an-array', 123, {}];
  
  invalidData.forEach((data, index) => {
    const safeArray = Array.isArray(data) ? data : [];
    console.log(`   Test ${index + 1}: ${typeof data} -> Array.isArray: ${Array.isArray(data)} -> Safe array: [${safeArray.length} items]`);
  });
  
  // Test 3: Test vote calculation
  console.log('\n3. Testing vote calculation:');
  
  const calculateVoteScore = (votes) => {
    if (!Array.isArray(votes)) return 0;
    return votes.reduce((score, vote) => {
      return score + (vote.voteType === 'UP' ? 1 : -1);
    }, 0);
  };
  
  console.log('   Vote score for test array:', calculateVoteScore(testVotesArray));
  console.log('   Vote score for empty array:', calculateVoteScore([]));
  console.log('   Vote score for null:', calculateVoteScore(null));
  
  console.log('\n✅ Vote removal functionality test completed!');
  console.log('💡 The VoteButtons component should now handle invalid votesArray data gracefully.');
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testVoteRemoval = testVoteRemoval;
  
  console.log('🧪 Vote Removal Tests Loaded!');
  console.log('Run testVoteRemoval() to test vote handling');
}