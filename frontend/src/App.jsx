import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import router from './routes';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ChakraProvider>
  );
}

export default App; 