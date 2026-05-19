import { Card, Text, Button } from '@chakra-ui/react'

/**
 * Reusable error state for API failures.
 *
 * Props:
 *   message  — string (required) – error text to display
 *   onRetry  — function (optional) – if provided, shows a Retry button
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <Card.Root
      bg="bg.card"
      borderRadius="xl"
      shadow="card"
      p={6}
      mb={6}
      borderColor="error"
    >
      <Text textStyle="body-md" color="error">
        {message}
      </Text>
      {onRetry && (
        <Button
          mt={3}
          size="sm"
          borderRadius="full"
          variant="outline"
          borderColor="error"
          color="error"
          onClick={onRetry}
          _hover={{ bg: 'error-container', color: 'on-error-container' }}
        >
          Reintentar
        </Button>
      )}
    </Card.Root>
  )
}
