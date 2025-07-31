/**
 * Enhanced VoteButtons component with separate up/down counts and outlined icons
 */
import React from 'react';
import {
  VStack,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { useVoting } from '../hooks/useVoting';
import { useUser } from '../context/UserContext';

const VoteButtons = ({ 
  itemId, 
  votes = 0, 
  votesArray = [], 
  isQuestion = false, 
  onVoteUpdate,
  size = 'md',
  layout = 'vertical' // 'vertical' or 'horizontal'
}) => {
  const { isAuthenticated, user } = useUser();
  const { handleVote, isVoting, getUserVote } = useVoting();
  
  // Color scheme
  const upvoteColor = useColorModeValue('green.500', 'green.400');
  const downvoteColor = useColorModeValue('red.500', 'red.400');
  const neutralColor = useColorModeValue('gray.400', 'gray.500');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Get current user's vote
  const userVote = getUserVote(votesArray, user?.id);
  const isUpvoted = userVote === 'UP';
  const isDownvoted = userVote === 'DOWN';
  const isCurrentlyVoting = isVoting(itemId);

  // Calculate separate up and down counts
  const upvotes = votesArray.filter(vote => vote.voteType === 'UP').length;
  const downvotes = votesArray.filter(vote => vote.voteType === 'DOWN').length;

  // Handle vote click
  const handleVoteClick = async (voteType) => {
    await handleVote(
      itemId, 
      voteType, 
      isQuestion, 
      votesArray, 
      onVoteUpdate
    );
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: 'sm',
      fontSize: 'sm',
      spacing: 2,
      iconBoxSize: 4
    },
    md: {
      iconSize: 'md',
      fontSize: 'md',
      spacing: 3,
      iconBoxSize: 5
    },
    lg: {
      iconSize: 'lg',
      fontSize: 'lg',
      spacing: 4,
      iconBoxSize: 6
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const UpvoteButton = () => (
    <Tooltip 
      label={
        !isAuthenticated 
          ? 'Login to vote' 
          : isUpvoted 
            ? 'Remove upvote' 
            : 'Upvote'
      }
      placement="top"
    >
      <HStack spacing={1}>
        <IconButton
          icon={<TriangleUpIcon boxSize={config.iconBoxSize} />}
          variant="outline"
          size={config.iconSize}
          aria-label="Upvote"
          onClick={() => handleVoteClick('up')}
          color={isUpvoted ? upvoteColor : neutralColor}
          borderColor={isUpvoted ? upvoteColor : borderColor}
          bg={isUpvoted ? useColorModeValue('green.50', 'green.900') : bgColor}
          _hover={{ 
            color: upvoteColor,
            borderColor: upvoteColor,
            bg: useColorModeValue('green.50', 'green.900')
          }}
          _active={{
            color: upvoteColor,
            borderColor: upvoteColor,
            bg: useColorModeValue('green.100', 'green.800')
          }}
          isLoading={isCurrentlyVoting}
          isDisabled={!isAuthenticated || isCurrentlyVoting}
          cursor={!isAuthenticated ? 'not-allowed' : 'pointer'}
        />
        <Text 
          fontSize={config.fontSize} 
          fontWeight="semibold" 
          color={isUpvoted ? upvoteColor : textColor}
          minW="4"
        >
          {upvotes}
        </Text>
      </HStack>
    </Tooltip>
  );

  const DownvoteButton = () => (
    <Tooltip 
      label={
        !isAuthenticated 
          ? 'Login to vote' 
          : isDownvoted 
            ? 'Remove downvote' 
            : 'Downvote'
      }
      placement="bottom"
    >
      <HStack spacing={1}>
        <IconButton
          icon={<TriangleDownIcon boxSize={config.iconBoxSize} />}
          variant="outline"
          size={config.iconSize}
          aria-label="Downvote"
          onClick={() => handleVoteClick('down')}
          color={isDownvoted ? downvoteColor : neutralColor}
          borderColor={isDownvoted ? downvoteColor : borderColor}
          bg={isDownvoted ? useColorModeValue('red.50', 'red.900') : bgColor}
          _hover={{ 
            color: downvoteColor,
            borderColor: downvoteColor,
            bg: useColorModeValue('red.50', 'red.900')
          }}
          _active={{
            color: downvoteColor,
            borderColor: downvoteColor,
            bg: useColorModeValue('red.100', 'red.800')
          }}
          isLoading={isCurrentlyVoting}
          isDisabled={!isAuthenticated || isCurrentlyVoting}
          cursor={!isAuthenticated ? 'not-allowed' : 'pointer'}
        />
        <Text 
          fontSize={config.fontSize} 
          fontWeight="semibold" 
          color={isDownvoted ? downvoteColor : textColor}
          minW="4"
        >
          {downvotes}
        </Text>
      </HStack>
    </Tooltip>
  );

  if (layout === 'horizontal') {
    return (
      <HStack spacing={config.spacing}>
        <UpvoteButton />
        <DownvoteButton />
      </HStack>
    );
  }

  return (
    <VStack spacing={config.spacing}>
      <UpvoteButton />
      <DownvoteButton />
    </VStack>
  );
};

export default VoteButtons;