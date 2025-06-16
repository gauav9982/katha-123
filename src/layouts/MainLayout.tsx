import React from 'react';
import { Box, Container, Flex, Stack, Button, Heading, Divider } from '@chakra-ui/react';
import { Link as RouterLink, Routes, Route } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="container.xl">
          <Stack spacing={4}>
            <Flex justify="space-between" align="center">
              <Heading size="lg">Katha Sales</Heading>
            </Flex>
            
            <Divider />
            
            <Flex gap={4} overflowX="auto" py={2}>
              <Button as={RouterLink} to="/cash-sales" colorScheme="blue" variant="ghost">
                Cash Sales
              </Button>
              <Button as={RouterLink} to="/credit-sales" colorScheme="green" variant="ghost">
                Credit Sales
              </Button>
              <Button as={RouterLink} to="/delivery-chalans" colorScheme="purple" variant="ghost">
                Delivery Chalans
              </Button>
              <Button as={RouterLink} to="/items" colorScheme="orange" variant="ghost">
                Items
              </Button>
              <Button as={RouterLink} to="/parties" colorScheme="cyan" variant="ghost">
                Parties
              </Button>
              <Button as={RouterLink} to="/reports" colorScheme="pink" variant="ghost">
                Reports
              </Button>
            </Flex>
          </Stack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Routes>
          <Route path="/" element={children} />
          {/* Other routes will be added here */}
        </Routes>
      </Container>
    </Box>
  );
};

export default MainLayout; 