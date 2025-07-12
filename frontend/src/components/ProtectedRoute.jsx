import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="brand.500" mb={4} />
          <Text color="gray.500">Loading...</Text>
        </Box>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 