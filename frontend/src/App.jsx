import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Text } from '@chakra-ui/react';

function App() {
  return (
    <Box minH="100vh">
      <Routes>
        <Route
          path="/"
          element={
            <Box textAlign="center" py={20}>
              <Text fontSize="4xl" fontWeight="bold">
                Gestión Académica Escolar
              </Text>
              <Text fontSize="lg" color="gray.600" mt={4}>
                Plataforma de gestión académica y comunicación escolar
              </Text>
            </Box>
          }
        />
      </Routes>
    </Box>
  );
}

export default App;
