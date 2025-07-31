/**
 * Data transformation utilities to handle field mapping between frontend and backend
 */

/**
 * Transform question data from frontend format to backend API format
 * @param {Object} frontendQuestion - Question data from frontend
 * @returns {Object} - Question data formatted for backend API
 */
export const transformQuestionForAPI = (frontendQuestion) => ({
  title: frontendQuestion.title,
  description: frontendQuestion.content, // Frontend uses 'content', backend expects 'description'
  tags: frontendQuestion.tags || []
});

/**
 * Transform question data from backend API format to frontend format
 * @param {Object} backendQuestion - Question data from backend API
 * @returns {Object} - Question data formatted for frontend
 */
export const transformQuestionFromAPI = (backendQuestion) => {
  if (!backendQuestion) return null;
  
  return {
    ...backendQuestion,
    content: backendQuestion.description, // Backend uses 'description', frontend expects 'content'
    tags: extractTagsFromBackend(backendQuestion.tags),
    author: transformUserFromAPI(backendQuestion.user),
    votes: backendQuestion.votes || calculateVoteScore(backendQuestion.votesArray || []),
    votesArray: backendQuestion.votesArray || backendQuestion.votes || [],
    answers: typeof backendQuestion.answers === 'number' ? backendQuestion.answers : (backendQuestion.answers?.length || 0),
    isOwner: false, // Will be set based on current user context
    createdAt: formatRelativeTime(backendQuestion.createdAt)
  };
};

/**
 * Transform answer data from frontend format to backend API format
 * @param {Object} frontendAnswer - Answer data from frontend
 * @returns {Object} - Answer data formatted for backend API
 */
export const transformAnswerForAPI = (frontendAnswer) => ({
  content: frontendAnswer.content,
  questionId: frontendAnswer.questionId
});

/**
 * Transform answer data from backend API format to frontend format
 * @param {Object} backendAnswer - Answer data from backend API
 * @returns {Object} - Answer data formatted for frontend
 */
export const transformAnswerFromAPI = (backendAnswer) => {
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

/**
 * Transform user data from backend API format to frontend format
 * @param {Object} backendUser - User data from backend API
 * @returns {Object} - User data formatted for frontend
 */
export const transformUserFromAPI = (backendUser) => {
  if (!backendUser) return null;
  
  return {
    id: backendUser.id,
    name: `${backendUser.firstName} ${backendUser.lastName}`.trim() || backendUser.email,
    email: backendUser.email,
    avatar: backendUser.avatar || null
  };
};

/**
 * Transform vote type from frontend format to backend format
 * @param {string} frontendVoteType - Vote type from frontend ('up' or 'down')
 * @returns {string} - Vote type formatted for backend ('UP' or 'DOWN')
 */
export const transformVoteType = (frontendVoteType) => {
  if (typeof frontendVoteType !== 'string') {
    throw new Error('Vote type must be a string');
  }
  
  const voteType = frontendVoteType.toUpperCase();
  if (!['UP', 'DOWN'].includes(voteType)) {
    throw new Error('Vote type must be "up" or "down"');
  }
  
  return voteType;
};

/**
 * Extract tags array from backend tag relationship format
 * @param {Array} backendTags - Tags from backend (QuestionTag relationships)
 * @returns {Array} - Simple array of tag names
 */
export const extractTagsFromBackend = (backendTags) => {
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

/**
 * Calculate vote score from vote array
 * @param {Array} votes - Array of vote objects from backend
 * @returns {number} - Net vote score
 */
export const calculateVoteScore = (votes) => {
  if (!Array.isArray(votes)) return 0;
  
  return votes.reduce((score, vote) => {
    return score + (vote.voteType === 'UP' ? 1 : -1);
  }, 0);
};

/**
 * Format timestamp to relative time string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp) => {
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

/**
 * Set ownership flags on questions/answers based on current user
 * @param {Array} items - Array of questions or answers
 * @param {Object} currentUser - Current logged-in user
 * @returns {Array} - Items with isOwner flags set
 */
export const setOwnershipFlags = (items, currentUser) => {
  if (!Array.isArray(items) || !currentUser) return items;
  
  return items.map(item => ({
    ...item,
    isOwner: item.userId === currentUser.id || item.author?.id === currentUser.id
  }));
};

/**
 * Transform API response data structure
 * @param {Object} response - Axios response object
 * @returns {Object} - Extracted data from response
 */
export const extractAPIData = (response) => {
  // Handle different response structures
  if (response.data?.data) {
    return response.data.data;
  }
  if (response.data) {
    return response.data;
  }
  return response;
};