import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { ChatIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import HtmlContent from '../components/HtmlContent';
import VoteButtons from '../components/VoteButtons';
import { questionsAPI } from '../services/api';
import { handleAPIError } from '../utils/errorHandler';
import { setOwnershipFlags } from '../utils/dataTransformers';

const HomePage = () => {
  const { isAuthenticated, user } = useUser();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  // State for questions and UI
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Latest, 1: Popular, 2: Unanswered

  // Fetch questions based on active tab
  const fetchQuestions = async (tabIndex = activeTab) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = getParamsForTab(tabIndex);
      const response = await questionsAPI.getAll(params);
      
      // Transform and set ownership flags
      let fetchedQuestions = response.data.questions || [];
      if (user) {
        fetchedQuestions = setOwnershipFlags(fetchedQuestions, user);
      }
      
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      const errorInfo = handleAPIError(error, toast);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // Get API parameters based on tab selection
  const getParamsForTab = (tabIndex) => {
    switch (tabIndex) {
      case 1: // Popular
        return { 
          sortBy: 'votes', 
          order: 'desc',
          limit: 20 
        };
      case 2: // Unanswered
        return { 
          hasAnswers: false,
          sortBy: 'createdAt',
          order: 'desc',
          limit: 20
        };
      default: // Latest
        return { 
          sortBy: 'createdAt', 
          order: 'desc',
          limit: 20
        };
    }
  };

  // Handle tab change
  const handleTabChange = (index) => {
    setActiveTab(index);
    fetchQuestions(index);
  };

  // Initial load
  useEffect(() => {
    fetchQuestions();
  }, []); // Only fetch on initial load
  
  // Update ownership flags when user changes (without re-fetching)
  useEffect(() => {
    if (user && questions.length > 0) {
      const questionsWithOwnership = setOwnershipFlags(questions, user);
      setQuestions(questionsWithOwnership);
    }
  }, [user]); // Only update ownership flags when user changes

  const QuestionCard = ({ question }) => {
    // Handle cases where question data might be incomplete
    const questionTitle = question.title || 'Untitled Question';
    const questionContent = question.content || question.description || '';
    const questionTags = question.tags || [];
    const questionAuthor = question.author || {};
    const authorName = questionAuthor.name || `${questionAuthor.firstName || ''} ${questionAuthor.lastName || ''}`.trim() || questionAuthor.email || 'Anonymous';
    const authorAvatar = questionAuthor.avatar;
    const questionVotes = question.votes || 0;
    const questionAnswers = question.answers || 0;
    const questionCreatedAt = question.createdAt || '';
    const questionVotesArray = question.votesArray || [];
    
    // Check if any answer is accepted (for questions with accepted answers)
    const hasAcceptedAnswer = question.hasAcceptedAnswer || 
      (question.answers && Array.isArray(question.answers) && question.answers.some(answer => answer.isAccepted));

    // Handle vote updates for this question
    const handleQuestionVoteUpdate = (voteData) => {
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === question.id 
            ? { 
                ...q, 
                votes: voteData.votes,
                votesArray: voteData.votesArray 
              }
            : q
        )
      );
    };

    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor} mb={{ base: 4, md: 6 }} p={{ base: 4, md: 6 }}>
        <CardHeader pb={2}>
          <Flex align="center" justify="space-between" gap={4}>
            <VStack align="start" spacing={{ base: 2, md: 3 }} flex={1}>
              <Heading size={{ base: "md", md: "lg" }} color="gray.800" lineHeight="tight">
                <RouterLink to={`/question/${question.id}`}>
                  {questionTitle}
                </RouterLink>
              </Heading>
              <HStack spacing={2} flexWrap="wrap">
                {questionTags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} colorScheme="brand" variant="subtle" size={{ base: "sm", md: "md" }}>
                    {tag}
                  </Badge>
                ))}
              </HStack>
            </VStack>
            {hasAcceptedAnswer && (
              <Icon as={CheckCircleIcon} color="green.500" boxSize={{ base: 5, md: 6 }} />
            )}
          </Flex>
        </CardHeader>
        
        <CardBody pt={0}>
          <Box color="gray.600" fontSize={{ base: "sm", md: "md" }} maxH="120px" overflow="hidden">
            <HtmlContent 
              content={questionContent} 
              sx={{
                '& p': { margin: '0.25rem 0' },
                '& h1, & h2, & h3, & h4, & h5, & h6': { margin: '0.25rem 0' },
              }}
            />
          </Box>
        </CardBody>
        
        <CardFooter pt={0}>
          <Flex w="full" align="center" justify="space-between" gap={4}>
            <HStack spacing={{ base: 4, md: 6 }}>
              <VoteButtons
                itemId={question.id}
                votes={questionVotes}
                votesArray={questionVotesArray}
                isQuestion={true}
                onVoteUpdate={handleQuestionVoteUpdate}
                size="sm"
                layout="horizontal"
              />
              <HStack spacing={1}>
                <Icon as={ChatIcon} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="medium">
                  {questionAnswers}
                </Text>
              </HStack>
            </HStack>
            
            <HStack spacing={3}>
              <Avatar 
                size={{ base: "sm", md: "md" }} 
                name={authorName} 
                src={authorAvatar} 
              />
              <VStack align="start" spacing={0}>
                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.800">
                  {authorName}
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                  {questionCreatedAt}
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </CardFooter>
      </Card>
    );
  };

  return (
    <Box w="full">
      <Flex 
        align="center" 
        justify="space-between" 
        mb={{ base: 6, md: 8, lg: 12 }}
        direction={{ base: "column", md: "row" }}
        gap={{ base: 4, md: 0 }}
      >
        <Box>
          <Heading size={{ base: "lg", md: "xl", lg: "2xl" }} color="gray.800" mb={2}>
            Welcome to StackIt
          </Heading>
          <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
            Ask questions, share knowledge, and learn from the community
          </Text>
        </Box>
        {isAuthenticated && (
          <Button
            as={RouterLink}
            to="/ask"
            colorScheme="brand"
            size={{ base: "md", md: "lg" }}
            px={{ base: 6, md: 8 }}
          >
            Ask Question
          </Button>
        )}
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="brand" index={activeTab} onChange={handleTabChange}>
        <TabList mb={{ base: 4, md: 6, lg: 8 }} fontSize={{ base: "sm", md: "md" }}>
          <Tab>Latest</Tab>
          <Tab>Popular</Tab>
          <Tab>Unanswered</Tab>
        </TabList>

        <TabPanels>
          {/* Loading State */}
          {loading && (
            <Center py={12}>
              <VStack spacing={4}>
                <Spinner size="lg" color="brand.500" />
                <Text color="gray.600">Loading questions...</Text>
              </VStack>
            </Center>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert status="error" borderRadius="md" mb={6}>
              <AlertIcon />
              <Box>
                <AlertTitle>Error loading questions!</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    ml={4}
                    onClick={() => fetchQuestions()}
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Questions Content */}
          {!loading && !error && (
            <>
              <TabPanel px={0}>
                {questions.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Text color="gray.500" fontSize="lg">No questions found</Text>
                      <Text color="gray.400" textAlign="center">
                        Be the first to ask a question in the community!
                      </Text>
                      {isAuthenticated && (
                        <Button as={RouterLink} to="/ask" colorScheme="brand">
                          Ask Question
                        </Button>
                      )}
                    </VStack>
                  </Center>
                ) : (
                  <VStack align="stretch" spacing={0}>
                    {questions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </VStack>
                )}
              </TabPanel>
              
              <TabPanel px={0}>
                {questions.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Text color="gray.500" fontSize="lg">No popular questions found</Text>
                      <Text color="gray.400" textAlign="center">
                        Questions with more votes will appear here.
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack align="stretch" spacing={0}>
                    {questions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </VStack>
                )}
              </TabPanel>
              
              <TabPanel px={0}>
                {questions.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Text color="gray.500" fontSize="lg">No unanswered questions found</Text>
                      <Text color="gray.400" textAlign="center">
                        All questions have been answered! Great job, community.
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack align="stretch" spacing={0}>
                    {questions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default HomePage; 