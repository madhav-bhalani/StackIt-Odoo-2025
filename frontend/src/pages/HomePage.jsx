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
  Spacer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon, ChatIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import HtmlContent from '../components/HtmlContent';

const HomePage = () => {
  const { isAuthenticated } = useUser();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data - replace with API calls
  const questions = [
    {
      id: 1,
      title: 'How to implement authentication in React with JWT?',
      content: 'I need help implementing JWT authentication in my React application...',
      author: 'John Doe',
      authorAvatar: 'https://bit.ly/john-doe',
      tags: ['react', 'jwt', 'authentication'],
      votes: 15,
      answers: 3,
      isAccepted: true,
      createdAt: '2 hours ago',
    },
    {
      id: 2,
      title: 'Best practices for state management in large React apps',
      content: 'What are the recommended patterns for managing state in large React applications?',
      author: 'Jane Smith',
      authorAvatar: 'https://bit.ly/jane-smith',
      tags: ['react', 'state-management', 'redux'],
      votes: 8,
      answers: 5,
      isAccepted: false,
      createdAt: '1 day ago',
    },
    {
      id: 3,
      title: 'How to optimize React component performance?',
      content: 'I have a component that re-renders too often. How can I optimize it?',
      author: 'Mike Johnson',
      authorAvatar: 'https://bit.ly/mike-johnson',
      tags: ['react', 'performance', 'optimization'],
      votes: 12,
      answers: 2,
      isAccepted: false,
      createdAt: '3 days ago',
    },
  ];

  const QuestionCard = ({ question }) => (
    <Card bg={cardBg} border="1px" borderColor={borderColor} mb={{ base: 4, md: 6 }} p={{ base: 4, md: 6 }}>
      <CardHeader pb={2}>
        <Flex align="center" justify="space-between" gap={4}>
          <VStack align="start" spacing={{ base: 2, md: 3 }} flex={1}>
            <Heading size={{ base: "md", md: "lg" }} color="gray.800" lineHeight="tight">
              <RouterLink to={`/question/${question.id}`}>
                {question.title}
              </RouterLink>
            </Heading>
            <HStack spacing={2} flexWrap="wrap">
              {question.tags.map((tag) => (
                <Badge key={tag} colorScheme="brand" variant="subtle" size={{ base: "sm", md: "md" }}>
                  {tag}
                </Badge>
              ))}
            </HStack>
          </VStack>
          {question.isAccepted && (
            <Icon as={CheckCircleIcon} color="green.500" boxSize={{ base: 5, md: 6 }} />
          )}
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <Box color="gray.600" fontSize={{ base: "sm", md: "md" }} maxH="120px" overflow="hidden">
          <HtmlContent 
            content={question.content} 
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
            <HStack spacing={1}>
              <Icon as={ArrowUpIcon} color="gray.400" boxSize={{ base: 4, md: 5 }} />
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="medium">
                {question.votes}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={ChatIcon} color="gray.400" boxSize={{ base: 4, md: 5 }} />
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="medium">
                {question.answers}
              </Text>
            </HStack>
          </HStack>
          
          <HStack spacing={3}>
            <Avatar size={{ base: "sm", md: "md" }} name={question.author} src={question.authorAvatar} />
            <VStack align="start" spacing={0}>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.800">
                {question.author}
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                {question.createdAt}
              </Text>
            </VStack>
          </HStack>
        </Flex>
      </CardFooter>
    </Card>
  );

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

      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={{ base: 4, md: 6, lg: 8 }} fontSize={{ base: "sm", md: "md" }}>
          <Tab>Latest</Tab>
          <Tab>Popular</Tab>
          <Tab>Unanswered</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <VStack align="stretch" spacing={0}>
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </VStack>
          </TabPanel>
          
          <TabPanel px={0}>
            <VStack align="stretch" spacing={0}>
              {questions.slice().reverse().map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </VStack>
          </TabPanel>
          
          <TabPanel px={0}>
            <VStack align="stretch" spacing={0}>
              {questions.filter(q => q.answers === 0).map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default HomePage; 