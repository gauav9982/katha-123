import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Heading, List, ListItem, Badge } from '@chakra-ui/react';
import { endpoints } from '../config/api';

const TestConnection: React.FC = () => {
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [purchasesCount, setPurchasesCount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const testConnections = async () => {
      try {
        setLoading(true);
        setError('');

        // Test items endpoint
        const itemsResponse = await endpoints.items.list();
        setItemsCount(itemsResponse.data.length);

        // Test purchases endpoint
        const purchasesResponse = await endpoints.purchases.list();
        setPurchasesCount(purchasesResponse.data.length);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    testConnections();
  }, []);

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Database Connection Test</Heading>
        
        {loading && <Text>Testing connections...</Text>}
        
        {error && (
          <Text color="red.500">
            Error: {error}
          </Text>
        )}

        {!loading && !error && (
          <List spacing={3}>
            <ListItem>
              Items: <Badge colorScheme="green">{itemsCount} records</Badge>
            </ListItem>
            <ListItem>
              Purchases: <Badge colorScheme="purple">{purchasesCount} records</Badge>
            </ListItem>
          </List>
        )}
      </VStack>
    </Box>
  );
};

export default TestConnection; 