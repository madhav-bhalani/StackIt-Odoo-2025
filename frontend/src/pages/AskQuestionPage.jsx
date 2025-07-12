import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, aiAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const AskQuestionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  // Add state for AI tags
  const [aiTags, setAiTags] = useState([]);
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock popular tags - replace with API call
  const popularTags = ['react', 'javascript', 'python', 'nodejs', 'css', 'html', 'typescript', 'vue', 'angular'];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Question content is required';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Question content must be at least 20 characters';
    }
    
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags(prev => [...prev, normalizedTag]);
      setTagInput('');
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Replace generateTags with a dummy implementation
  const generateTags = async () => {
    // Dummy AI tags
    const dummyTags = [
      'react', 'javascript', 'frontend', 'hooks', 'tiptap',
      'chakraui', 'vite', 'context', 'state', 'performance'
    ];
    setAiTags(dummyTags);
    // Auto-select the first 3
    const autoSelected = dummyTags.slice(0, 3).filter(tag => !tags.includes(tag));
    setTags(prev => [...prev, ...autoSelected]);
    // Show toast
    toast({
      title: 'AI Tags generated',
      description: `3 tags auto-selected, 10 suggested`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const questionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags,
      };
      console.log('Posting question:', questionData);
      const response = await questionsAPI.create(questionData);
      
      toast({
        title: 'Question posted',
        description: 'Your question has been successfully posted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate(`/question/${response.data.id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to post question';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="full" maxW={{ base: "100%", lg: "900px", xl: "1000px" }} mx="auto">
      <VStack spacing={{ base: 6, md: 8, lg: 10 }} align="stretch">
        <Box>
          <Heading size={{ base: "lg", md: "xl", lg: "2xl" }} color="gray.800" mb={2}>
            Ask a Question
          </Heading>
          <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
            Share your knowledge and help others learn
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel fontSize={{ base: "md", md: "lg" }}>Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What's your question? Be specific."
                size={{ base: "md", md: "lg" }}
                border="1px"
                borderColor={borderColor}
                fontSize={{ base: "md", md: "lg" }}
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.content}>
              <FormLabel fontSize={{ base: "md", md: "lg" }}>Question Details</FormLabel>
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                placeholder="Provide more context about your question. You can use the toolbar above to format your text, add links, images, and more."
              />
              <FormErrorMessage>{errors.content}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.tags}>
              <FormLabel fontSize={{ base: "md", md: "lg" }}>Tags</FormLabel>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <HStack>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Add tags..."
                      border="1px"
                      borderColor={borderColor}
                    />
                  </InputGroup>
                  <Button
                    onClick={() => addTag(tagInput)}
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    variant="outline"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={generateTags}
                    isLoading={isGeneratingTags}
                    loadingText="Generating..."
                    variant="solid"
                    color="white"
                    fontWeight="bold"
                    bgGradient="linear(to-r, purple.500, pink.400, yellow.400)"
                    bgSize="200% 200%"
                    _hover={{ bgGradient: 'linear(to-r, pink.400, yellow.400, purple.500)', filter: 'brightness(1.1)' }}
                    _active={{ bgGradient: 'linear(to-r, yellow.400, purple.500, pink.400)' }}
                    sx={{
                      animation: 'shine 2s linear infinite',
                      '@keyframes shine': {
                        '0%': { backgroundPosition: '0% 50%' },
                        '100%': { backgroundPosition: '100% 50%' },
                      },
                    }}
                  >
                    AI Suggest
                  </Button>
                </HStack>

                {tags.length > 0 && (
                  <HStack spacing={2} flexWrap="wrap">
                    {tags.map((tag) => (
                      <Tag key={tag} size="md" colorScheme="brand" borderRadius="full">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(tag)} />
                      </Tag>
                    ))}
                  </HStack>
                )}

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Popular tags:
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {popularTags.map((tag) => (
                      <Tag
                        key={tag}
                        size="sm"
                        variant="outline"
                        cursor="pointer"
                        onClick={() => addTag(tag)}
                        _hover={{ bg: 'brand.50' }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                </Box>
                {/* AI Tags */}
                {aiTags.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="purple.600" mb={2} fontWeight="bold">
                      AI Tags:
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {aiTags.map((tag) => {
                        const isSelected = tags.includes(tag);
                        return (
                          <Tag
                            key={tag}
                            size="sm"
                            variant={isSelected ? 'solid' : 'outline'}
                            colorScheme={isSelected ? 'purple' : 'gray'}
                            cursor="pointer"
                            onClick={() => {
                              if (isSelected) {
                                setTags(prev => prev.filter(t => t !== tag));
                              } else {
                                setTags(prev => [...prev, tag]);
                              }
                            }}
                            _hover={{ bg: isSelected ? 'purple.500' : 'purple.50' }}
                          >
                            {tag}
                          </Tag>
                        );
                      })}
                    </HStack>
                  </Box>
                )}
              </VStack>
              <FormErrorMessage>{errors.tags}</FormErrorMessage>
            </FormControl>

            <HStack justify="flex-end" spacing={{ base: 4, md: 6 }}>
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                size={{ base: "md", md: "lg" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                size={{ base: "md", md: "lg" }}
                isLoading={isLoading}
                loadingText="Posting..."
                px={{ base: 6, md: 8 }}
              >
                Post Question
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AskQuestionPage; 