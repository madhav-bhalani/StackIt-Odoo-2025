import {
  Box,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, HamburgerIcon, BellIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, user, logout } = useUser();
  const navigate = useNavigate();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavLink = ({ to, children, ...props }) => (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      color="gray.600"
      _hover={{ color: 'brand.500', bg: 'brand.50' }}
      {...props}
    >
      {children}
    </Button>
  );

  const MobileNav = () => (
    <VStack spacing={4} align="stretch">
      <NavLink to="/" onClick={onClose}>
        Home
      </NavLink>
      {isAuthenticated ? (
        <>
          <NavLink to="/ask" onClick={onClose}>
            Ask Question
          </NavLink>
          <Button
            variant="ghost"
            color="gray.600"
            onClick={() => {
              handleLogout();
              onClose();
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <NavLink to="/login" onClick={onClose}>
            Login
          </NavLink>
          <NavLink to="/register" onClick={onClose}>
            Register
          </NavLink>
        </>
      )}
    </VStack>
  );

  return (
    <>
      <Box
        as="nav"
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex
          w="full"
          px={{ base: 4, md: 6, lg: 8, xl: 12, "2xl": 16 }}
          py={{ base: 3, md: 4, lg: 6 }}
          align="center"
          justify="space-between"
        >
          {/* Logo */}
          <Button
            as={RouterLink}
            to="/"
            variant="ghost"
            fontSize="xl"
            fontWeight="bold"
            color="brand.500"
            _hover={{ bg: 'brand.50' }}
          >
            StackIt
          </Button>

          {/* Desktop Search */}
          <Box display={{ base: 'none', md: 'block' }} flex={1} maxW={{ md: "500px", lg: "700px", xl: "800px" }} mx={{ md: 6, lg: 8, xl: 12 }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search questions..."
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
              />
            </InputGroup>
          </Box>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            {isAuthenticated ? (
              <>
                <Button
                  as={RouterLink}
                  to="/ask"
                  colorScheme="brand"
                  size="sm"
                >
                  Ask Question
                </Button>
                
                {/* Notifications */}
                <IconButton
                  icon={<BellIcon boxSize="1.7em" />}
                  variant="ghost"
                  size="md"
                  position="relative"
                  aria-label="Notifications"
                >
                  <Badge
                    position="absolute"
                    top={1}
                    right={1}
                    colorScheme="red"
                    size="sm"
                    borderRadius="full"
                  >
                    3
                  </Badge>
                </IconButton>

                {/* User Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    px={2}
                    py={2}
                    _hover={{ bg: 'gray.100' }}
                  >
                    <HStack spacing={2}>
                      <Avatar size="sm" name={user?.name} src={user?.avatar} />
                      <Text fontSize="sm" display={{ base: 'none', lg: 'block' }}>
                        {user?.name}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Button as={RouterLink} to="/register" colorScheme="brand" size="sm">
                  Register
                </Button>
              </>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            icon={<HamburgerIcon />}
            variant="ghost"
            aria-label="Open menu"
          />
        </Flex>

                  {/* Mobile Search */}
          <Box display={{ base: 'block', md: 'none' }} px={{ base: 4, sm: 6 }} pb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search questions..."
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
            />
          </InputGroup>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <MobileNav />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar; 