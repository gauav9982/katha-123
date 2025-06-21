import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Heading, List, ListItem, Badge } from '@chakra-ui/react';
import { API_URL } from '../config';
import axios from 'axios';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testEndpoints = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Test endpoints
        const endpoints = [
          { name: 'Groups', url: API_URL.GROUPS },
          { name: 'Categories', url: API_URL.CATEGORIES },
          { name: 'Items', url: API_URL.ITEMS },
          { name: 'Cash Sales', url: API_URL.CASHSALES },
          { name: 'Credit Sales', url: API_URL.CREDITSALES },
          { name: 'Purchases', url: API_URL.PURCHASES }
        ];

        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              await axios.get(endpoint.url);
              return { [endpoint.name]: true };
            } catch {
              return { [endpoint.name]: false };
            }
          })
        );

        const combinedStatus = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setStatus(combinedStatus);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error testing connections');
      } finally {
        setLoading(false);
      }
    };

    testEndpoints();
  }, []);

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <VStack align="stretch" spacing={4}>
        <Heading size="md">API Connection Test</Heading>
        
        {loading && <Text>Testing API connections...</Text>}
        
        {error && (
          <Text color="red.500">
            Error: {error}
          </Text>
        )}

        {!loading && !error && (
          <List spacing={3}>
            {Object.entries(status).map(([endpoint, isWorking]) => (
              <ListItem key={endpoint}>
                {endpoint}: <Badge colorScheme={isWorking ? "green" : "red"}>
                  {isWorking ? "Connected" : "Failed"}
                </Badge>
              </ListItem>
            ))}
          </List>
        )}
      </VStack>
    </Box>
  );
};

export default TestConnection; 