import { Box, Heading, Text, Icon } from '@chakra-ui/react';

export default function EmptyState({ icon: IconComponent, title, description, action }) {
  return (
    <Box
      textAlign="center"
      py={12}
      px={6}
      borderRadius="card"
      bg="containerLow"
    >
      {IconComponent && (
        <Icon
          as={IconComponent}
          boxSize={12}
          color="onSurfaceVariant"
          mb={4}
          opacity={0.5}
        />
      )}
      <Heading as="h3" size="md" color="onSurface" mb={2}>
        {title}
      </Heading>
      {description && (
        <Text color="onSurfaceVariant" fontSize="sm" mb={action ? 4 : 0}>
          {description}
        </Text>
      )}
      {action && <Box>{action}</Box>}
    </Box>
  );
}
