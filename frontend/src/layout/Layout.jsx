import { Outlet } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import { useUser } from '../context/UserContext';

const Layout = () => {
  const { isLoading } = useUser();
  
  return (
    <Box minH="100vh" bg="gray.50" position="relative">
      <Navbar />
      <Box py={{ base: 4, md: 8, lg: 12 }} px={{ base: 4, md: 6, lg: 8, xl: 12, "2xl": 16 }}>
        {isLoading ? (
          <Center py={20}>
            <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" label="Loading..." />
          </Center>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
};

export default Layout; 