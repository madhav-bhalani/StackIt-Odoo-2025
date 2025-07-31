/**
 * Custom hook for handling voting functionality with optimistic updates
 */
import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { questionsAPI, answersAPI } from '../services/api';
import { handleAPIError, showSuccessMessage } from '../utils/errorHandler';
import { useUser } from '../context/UserContext';

export const useVoting = () => {
  const { isAuthenticated, user } = useUser();
  const toast = useToast();
  const [votingStates, setVotingStates] = useState({});

  // Track voting state for items to prevent duplicate requests
  const isVoting = useCallback((itemId) => {
    return votingStates[itemId]?.isVoting || false;
  }, [votingStates]);

  // Get current user vote for an item
  const getUserVote = useCallback((votes, userId) => {
    if (!Array.isArray(votes) || !userId) return null;
    const userVote = votes.find(vote => vote.userId === userId);
    return userVote ? userVote.voteType : null;
  }, []);

  // Calculate vote score from votes array
  const calculateVoteScore = useCallback((votes) => {
    if (!Array.isArray(votes)) return 0;
    return votes.reduce((score, vote) => {
      return score + (vote.voteType === 'UP' ? 1 : -1);
    }, 0);
  }, []);

  // Handle voting with optimistic updates
  const handleVote = useCallback(async (itemId, voteType, isQuestion = false, currentVotes = [], onUpdate) => {
    // Check authentication
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to vote',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Prevent duplicate voting requests
    if (isVoting(itemId)) {
      return;
    }

    // Set voting state
    setVotingStates(prev => ({
      ...prev,
      [itemId]: { isVoting: true }
    }));

    try {
      const currentUserVote = getUserVote(currentVotes, user.id);
      const currentScore = calculateVoteScore(currentVotes);
      
      // Determine the action and optimistic update
      let optimisticScoreChange = 0;
      let newUserVote = null;
      
      if (currentUserVote === voteType.toUpperCase()) {
        // User is removing their vote
        optimisticScoreChange = voteType.toUpperCase() === 'UP' ? -1 : 1;
        newUserVote = null;
      } else if (currentUserVote && currentUserVote !== voteType.toUpperCase()) {
        // User is changing their vote
        optimisticScoreChange = voteType.toUpperCase() === 'UP' ? 2 : -2;
        newUserVote = voteType.toUpperCase();
      } else {
        // User is casting a new vote
        optimisticScoreChange = voteType.toUpperCase() === 'UP' ? 1 : -1;
        newUserVote = voteType.toUpperCase();
      }

      // Apply optimistic update
      const optimisticScore = currentScore + optimisticScoreChange;
      const optimisticVotes = [...currentVotes];
      
      // Update or add user vote in optimistic votes array
      const existingVoteIndex = optimisticVotes.findIndex(vote => vote.userId === user.id);
      if (newUserVote) {
        const voteData = { userId: user.id, voteType: newUserVote };
        if (existingVoteIndex >= 0) {
          optimisticVotes[existingVoteIndex] = voteData;
        } else {
          optimisticVotes.push(voteData);
        }
      } else if (existingVoteIndex >= 0) {
        optimisticVotes.splice(existingVoteIndex, 1);
      }

      // Update UI optimistically
      if (onUpdate) {
        onUpdate({
          votes: optimisticScore,
          votesArray: optimisticVotes,
          userVote: newUserVote
        });
      }

      // Make API call
      const apiCall = isQuestion ? questionsAPI.vote : answersAPI.vote;
      const response = await apiCall(itemId, voteType);

      // Handle successful response
      if (response.data) {
        const actualVotes = response.data.votes || response.data.data?.votes;
        if (actualVotes) {
          // Update with actual data from server
          if (onUpdate) {
            onUpdate({
              votes: calculateVoteScore(actualVotes),
              votesArray: actualVotes,
              userVote: getUserVote(actualVotes, user.id)
            });
          }
        }
      }

      // Show success feedback (subtle)
      const action = currentUserVote === voteType.toUpperCase() ? 'removed' : 
                   currentUserVote ? 'changed' : 'added';
      
      showSuccessMessage(toast, 'Vote updated', `Your ${voteType}vote has been ${action}`);

    } catch (error) {
      console.error('Voting error:', error);
      
      // Revert optimistic update on error
      if (onUpdate) {
        onUpdate({
          votes: calculateVoteScore(currentVotes),
          votesArray: currentVotes,
          userVote: getUserVote(currentVotes, user.id)
        });
      }

      // Handle specific error cases
      if (error.response?.status === 409) {
        // Conflict - user already voted
        toast({
          title: 'Vote conflict',
          description: 'You have already voted on this item. Please refresh the page.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      } else {
        handleAPIError(error, toast, {
          defaultMessage: 'Failed to register your vote. Please try again.'
        });
      }
    } finally {
      // Clear voting state
      setVotingStates(prev => ({
        ...prev,
        [itemId]: { isVoting: false }
      }));
    }
  }, [isAuthenticated, user, toast, isVoting, getUserVote, calculateVoteScore]);

  return {
    handleVote,
    isVoting,
    getUserVote,
    calculateVoteScore
  };
};