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
  Avatar,
  Icon,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  CheckCircleIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { questionsAPI, answersAPI, aiAPI } from '../services/api';
import { handleAPIError, showSuccessMessage } from '../utils/errorHandler';
import { setOwnershipFlags } from '../utils/dataTransformers';
import RichTextEditor from '../components/RichTextEditor';
import HtmlContent from '../components/HtmlContent';
import VoteButtons from '../components/VoteButtons';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryTitle, setSummaryTitle] = useState('');

  const openSummary = (title, summary) => {
    setSummaryTitle(title);
    setSummaryText(summary);
    setIsSummaryOpen(true);
  };
  const closeSummary = () => setIsSummaryOpen(false);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch real data from API
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Fetch question and answers in parallel
        const [questionResponse, answersResponse] = await Promise.all([
          questionsAPI.getById(id),
          answersAPI.getByQuestionId(id)
        ]);

        // Process question data
        const questionData = questionResponse.data;
        if (questionData) {
          // Set ownership flag based on current user
          questionData.isOwner = user && questionData.userId === user.id;
          setQuestion(questionData);
        } else {
          setQuestion(null);
        }

        // Process answers data
        const answersData = answersResponse.data || [];
        // Set ownership flags for answers
        const answersWithOwnership = setOwnershipFlags(answersData, user);
        setAnswers(answersWithOwnership);

      } catch (error) {
        console.error('Error fetching question and answers:', error);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
          setQuestion(null);
          setAnswers([]);
          handleAPIError(error, toast, { 
            defaultMessage: 'Question not found' 
          });
        } else {
          handleAPIError(error, toast, { 
            defaultMessage: 'Failed to load question and answers' 
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionAndAnswers();
  }, [id, user, toast]);

  // Handle vote updates for question
  const handleQuestionVoteUpdate = (voteData) => {
    setQuestion(prev => ({
      ...prev,
      votes: voteData.votes,
      votesArray: voteData.votesArray
    }));
  };

  // Handle vote updates for answers
  const handleAnswerVoteUpdate = (answerId, voteData) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { 
            ...answer, 
            votes: voteData.votes,
            votesArray: voteData.votesArray 
          }
        : answer
    ));
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await answersAPI.accept(answerId);
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId,
      })));
      showSuccessMessage(toast, 'Answer accepted', 'The answer has been marked as accepted');
    } catch (error) {
      handleAPIError(error, toast, { 
        defaultMessage: 'Failed to accept answer' 
      });
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!newAnswer.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an answer',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmittingAnswer(true);
    
    try {
      const response = await answersAPI.create({ 
        content: newAnswer, 
        questionId: id 
      });
      
      // Use the transformed answer data from the API response
      const newAnswerData = response.data;
      
      // Set ownership flag for the new answer
      newAnswerData.isOwner = true;
      
      setAnswers(prev => [newAnswerData, ...prev]);
      setNewAnswer('');
      
      showSuccessMessage(toast, 'Answer posted', 'Your answer has been successfully posted');
    } catch (error) {
      handleAPIError(error, toast, { 
        defaultMessage: 'Failed to post answer' 
      });
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const generateAIAnswer = async () => {
    if (!question.isOwner) {
      toast({
        title: 'Not authorized',
        description: 'Only the question owner can generate AI answers',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Static AI answer
      const aiAnswer = {
        id: `ai-${Date.now()}`,
        content: 'This is an AI-generated answer: To implement JWT authentication in React, use a library like jsonwebtoken on the backend and store the token in HttpOnly cookies or localStorage. On the frontend, send the token with each request and protect routes using context or hooks.',
        author: 'AI User',
        authorAvatar: null,
        votes: 0,
        isAccepted: false,
        createdAt: 'Just now',
        isOwner: false,
        isAI: true,
      };
      setAnswers(prev => [aiAnswer, ...prev]);
      toast({
        title: 'AI Answer generated',
        description: 'An AI-generated answer has been added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };



  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Text>Loading question...</Text>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box textAlign="center" py={8}>
        <Text>Question not found</Text>
      </Box>
    );
  }

  return (
    <Box w="full" maxW={{ base: "100%", lg: "1200px", xl: "1400px" }} mx="auto">
      <VStack spacing={{ base: 6, md: 8, lg: 10 }} align="stretch">
        {/* Question */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} p={{ base: 4, md: 6, lg: 8 }}>
          <CardHeader pb={4}>
            <Flex align="start" gap={{ base: 4, md: 6 }}>
              <VoteButtons 
                itemId={question.id}
                votes={question.votes}
                votesArray={question.votesArray || []}
                isQuestion={true}
                onVoteUpdate={handleQuestionVoteUpdate}
                size="md"
              />
              <Box flex={1}>
                <Heading size={{ base: "lg", md: "xl", lg: "2xl" }} color="gray.800" mb={3}>
                  {question.title}
                </Heading>
                <HStack spacing={2} mb={4} flexWrap="wrap">
                  {question.tags.map((tag) => (
                    <Badge key={tag} colorScheme="brand" variant="subtle" size={{ base: "sm", md: "md" }}>
                      {tag}
                    </Badge>
                  ))}
                </HStack>
                <HtmlContent 
                  content={question.content} 
                  color="gray.600" 
                  lineHeight="tall" 
                  fontSize={{ base: "md", lg: "lg" }}
                />
              </Box>
            </Flex>
          </CardHeader>
          
          <CardFooter pt={4}>
            <Flex w="full" justify="space-between" align="center" gap={4}>
              <HStack spacing={3}>
                <Avatar size={{ base: "sm", md: "md" }} name={question.author?.name || question.author} src={question.author?.avatar} />
                <VStack align="start" spacing={0}>
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.800">
                    {question.author?.name || question.author}
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    {question.createdAt}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                <Button
                  size={{ base: "sm", md: "md" }}
                  fontWeight="bold"
                  leftIcon={<span role="img" aria-label="sparkle">✨</span>}
                  bgGradient="linear(to-r, purple.500, pink.400, yellow.400)"
                  color="white"
                  _hover={{ bgGradient: 'linear(to-r, pink.400, yellow.400, purple.500)', filter: 'brightness(1.1)' }}
                  _active={{ bgGradient: 'linear(to-r, yellow.400, purple.500, pink.400)' }}
                  sx={{
                    animation: 'shine 2s linear infinite',
                    '@keyframes shine': {
                      '0%': { backgroundPosition: '0% 50%' },
                      '100%': { backgroundPosition: '100% 50%' },
                    },
                  }}
                  variant="solid"
                  onClick={() => openSummary('Question Summary', 'This is a simple summary of the question in plain language.')}
                >
                  AI Summarize
                </Button>
                {question.isOwner && (
                  <Button
                    leftIcon={<StarIcon />}
                    onClick={generateAIAnswer}
                    isLoading={isGeneratingAI}
                    loadingText="Generating..."
                    colorScheme="brand"
                    variant="outline"
                    size={{ base: "sm", md: "md" }}
                  >
                    Generate AI Answer
                  </Button>
                )}
              </HStack>
            </Flex>
          </CardFooter>
        </Card>

        {/* Answers Section */}
        <Box>
          <Heading size={{ base: "md", md: "lg", lg: "xl" }} color="gray.800" mb={{ base: 4, md: 6 }}>
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </Heading>
          
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            {answers.map((answer) => (
              <Card key={answer.id} bg={cardBg} border="1px" borderColor={borderColor} p={{ base: 4, md: 6 }}>
                <CardBody p={0}>
                  <Flex align="start" gap={{ base: 4, md: 6 }}>
                    <VoteButtons 
                      itemId={answer.id}
                      votes={answer.votes}
                      votesArray={answer.votesArray || []}
                      isQuestion={false}
                      onVoteUpdate={(voteData) => handleAnswerVoteUpdate(answer.id, voteData)}
                      size="md"
                    />
                                         <Box flex={1}>
                       <Flex align="center" justify="space-between" mb={3} gap={4}>
                         <HStack spacing={3}>
                           <Avatar size={{ base: "sm", md: "md" }} name={answer.author?.name || answer.author} src={answer.author?.avatar} />
                         
                           <VStack align="start" spacing={0}>
                             <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.800">
                               {answer.author?.name || answer.author}
                               {answer.isAI && (
                                 <Badge ml={2} colorScheme="purple" size={{ base: "sm", md: "md" }}>
                                   AI
                                 </Badge>
                               )}
                             </Text>
                             <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                               {answer.createdAt}
                             </Text>
                           </VStack>
                           {answer.isAccepted && (
                             <VStack align="start" spacing={0} ml={2}>
                               <Icon as={CheckCircleIcon} color="green.500" boxSize={{ base: 5, md: 6 }} />
                               <Text fontSize={{ base: "xs", md: "sm" }} color="green.600">
                                 Accepted answer
                               </Text>
                             </VStack>
                           )}
                         </HStack>
                         
                         <HStack spacing={3}>
                           <Button
                             size={{ base: "xs", md: "sm" }}
                             fontWeight="bold"
                             leftIcon={<span role="img" aria-label="sparkle">✨</span>}
                             bgGradient="linear(to-r, purple.500, pink.400, yellow.400)"
                             color="white"
                             _hover={{ bgGradient: 'linear(to-r, pink.400, yellow.400, purple.500)', filter: 'brightness(1.1)' }}
                             _active={{ bgGradient: 'linear(to-r, yellow.400, purple.500, pink.400)' }}
                             sx={{
                               animation: 'shine 2s linear infinite',
                               '@keyframes shine': {
                                 '0%': { backgroundPosition: '0% 50%' },
                                 '100%': { backgroundPosition: '100% 50%' },
                               },
                             }}
                             variant="solid"
                             onClick={() => openSummary('Answer Summary', 'This is a simple summary of the answer in plain language.')}
                           >
                             AI Summarize
                           </Button>
                          
                           {question.isOwner && !answer.isAccepted && !answer.isAI && (
                             <Button
                               size={{ base: "sm", md: "md" }}
                               variant="ghost"
                               colorScheme="green"
                               onClick={() => handleAcceptAnswer(answer.id)}
                             >
                               Accept
                             </Button>
                           )}
                         </HStack>
                       </Flex>
                       
                       <HtmlContent 
                         content={answer.content} 
                         color="gray.700" 
                         lineHeight="tall" 
                         fontSize={{ base: "md", lg: "lg" }}
                       />
                     </Box>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </Box>

        {/* Answer Form */}
        {isAuthenticated && (
          <Card bg={cardBg} border="1px" borderColor={borderColor} p={{ base: 4, md: 6, lg: 8 }}>
            <CardHeader pb={4}>
              <Heading size={{ base: "md", md: "lg", lg: "xl" }} color="gray.800">
                Your Answer
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <form onSubmit={handleSubmitAnswer}>
                <VStack spacing={{ base: 4, md: 6 }}>
                  <RichTextEditor
                    value={newAnswer}
                    onChange={setNewAnswer}
                    placeholder="Write your answer here... Use the toolbar above to format your text, add links, images, and more."
                  />
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isSubmittingAnswer}
                    loadingText="Posting..."
                    alignSelf="flex-end"
                    size={{ base: "md", md: "lg" }}
                    px={{ base: 6, md: 8 }}
                  >
                    Post Answer
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        )}
      </VStack>

      <Modal isOpen={isSummaryOpen} onClose={closeSummary} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{summaryTitle}</ModalHeader>
          <ModalBody>
            <Text>{summaryText}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={closeSummary}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionDetailPage; 