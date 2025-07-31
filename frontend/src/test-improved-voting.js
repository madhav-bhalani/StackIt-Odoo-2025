// Test script to verify improved voting functionality
// This is a simple Node.js test script

// Mock the data transformers functions
const transformUserFromAPI = (backendUser) => {
  if (!backendUser) return null;
  
  return {
    id: backendUser.id,
    name: `${backendUser.firstName} ${backendUser.lastName}`.trim() || backendUser.email,
    email: backendUser.email,
    avatar: backendUser.avatar || null
  };
};

const calculateVoteScore = (votes) => {
  if (!Array.isArray(votes)) return 0;
  
  return votes.reduce((score, vote) => {
    return score + (vote.voteType === 'UP' ? 1 : -1);
  }, 0);
};

const extractTagsFromBackend = (backendTags) => {
  if (!Array.isArray(backendTags)) return [];
  
  return backendTags.map(tagRelation => {
    // Handle both direct tag objects and QuestionTag relationships
    if (tagRelation.tag && tagRelation.tag.name) {
      return tagRelation.tag.name;
    }
    if (tagRelation.name) {
      return tagRelation.name;
    }
    if (typeof tagRelation === 'string') {
      return tagRelation;
    }
    return null;
  }).filter(Boolean);
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

const transformAnswerFromAPI = (backendAnswer) => {
  if (!backendAnswer) return null;
  
  return {
    ...backendAnswer,
    author: transformUserFromAPI(backendAnswer.user),
    votes: backendAnswer.votes || calculateVoteScore(backendAnswer.votesArray || []),
    votesArray: backendAnswer.votesArray || backendAnswer.votes || [],
    isOwner: false, // Will be set based on current user context
    createdAt: formatRelativeTime(backendAnswer.createdAt)
  };
};

const transformQuestionFromAPI = (backendQuestion) => {
  if (!backendQuestion) return null;
  
  return {
    ...backendQuestion,
    content: backendQuestion.description, // Backend uses 'description', frontend expects 'content'
    tags: extractTagsFromBackend(backendQuestion.tags),
    author: transformUserFromAPI(backendQuestion.user),
    votes: backendQuestion.votes || calculateVoteScore(backendQuestion.votesArray || []),
    votesArray: backendQuestion.votesArray || backendQuestion.votes || [],
    answers: backendQuestion.answers?.length || 0,
    isOwner: false, // Will be set based on current user context
    createdAt: formatRelativeTime(backendQuestion.createdAt)
  };
};

// Test data that simulates backend response
const mockBackendAnswer = {
  id: 'answer-123',
  content: 'This is a test answer',
  isAccepted: false,
  createdAt: '2025-07-31T09:18:27.780Z',
  updatedAt: '2025-07-31T09:18:27.780Z',
  userId: 'user-123',
  questionId: 'question-123',
  user: {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  },
  votes: 1,
  votesArray: [
    { userId: 'user-123', voteType: 'UP' }
  ]
};

const mockBackendQuestion = {
  id: 'question-123',
  title: 'Test Question',
  description: 'This is a test question',
  createdAt: '2025-07-31T09:18:27.780Z',
  updatedAt: '2025-07-31T09:18:27.780Z',
  userId: 'user-123',
  user: {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  },
  tags: [
    { tag: { name: 'javascript' } },
    { tag: { name: 'react' } }
  ],
  votes: 2,
  votesArray: [
    { userId: 'user-123', voteType: 'UP' },
    { userId: 'user-456', voteType: 'UP' }
  ],
  answers: []
};

console.log('🧪 Testing improved data transformations...\n');

// Test answer transformation
console.log('1. Testing answer transformation:');
const transformedAnswer = transformAnswerFromAPI(mockBackendAnswer);
console.log('✅ Transformed answer:', JSON.stringify(transformedAnswer, null, 2));

// Verify answer has correct vote data
if (transformedAnswer.votes === 1 && transformedAnswer.votesArray.length === 1) {
  console.log('✅ Answer vote data is correct');
} else {
  console.log('❌ Answer vote data is incorrect');
}

// Test question transformation
console.log('\n2. Testing question transformation:');
const transformedQuestion = transformQuestionFromAPI(mockBackendQuestion);
console.log('✅ Transformed question:', JSON.stringify(transformedQuestion, null, 2));

// Verify question has correct vote data
if (transformedQuestion.votes === 2 && transformedQuestion.votesArray.length === 2) {
  console.log('✅ Question vote data is correct');
} else {
  console.log('❌ Question vote data is incorrect');
}

// Verify question content transformation
if (transformedQuestion.content === mockBackendQuestion.description) {
  console.log('✅ Question content transformation is correct');
} else {
  console.log('❌ Question content transformation is incorrect');
}

// Verify tags transformation
if (transformedQuestion.tags.length === 2 && transformedQuestion.tags.includes('javascript')) {
  console.log('✅ Question tags transformation is correct');
} else {
  console.log('❌ Question tags transformation is incorrect');
}

console.log('\n🎉 Data transformation tests completed!');