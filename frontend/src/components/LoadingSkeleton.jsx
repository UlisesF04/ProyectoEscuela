import { Box, Skeleton, SkeletonText, SkeletonCircle } from '@chakra-ui/react';

export default function LoadingSkeleton({ variant = 'text', rows = 3, columns = 4 }) {
  if (variant === 'table') {
    return (
      <Box w="full">
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} display="flex" gap={4} mb={3}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} h="32px" flex={1} borderRadius="md" />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} p={6} borderRadius="card" bg="white" boxShadow="warmSm">
            <SkeletonCircle size="10" mb={4} />
            <SkeletonText noOfLines={3} spacing={3} skeletonHeight={3} />
          </Box>
        ))}
      </Box>
    );
  }

  // text variant (default)
  return (
    <Box w="full">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonText key={i} noOfLines={2} spacing={3} skeletonHeight={3} mb={4} />
      ))}
    </Box>
  );
}
