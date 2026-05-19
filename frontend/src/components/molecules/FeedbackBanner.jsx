import { Box } from '@chakra-ui/react'

/**
 * Reusable feedback banner used across almost every page.
 * Supports ✅ (success), ❌ (error), or plain text messages.
 */
export default function FeedbackBanner({ feedback }) {
  if (!feedback) return null
  return (
    <Box
      mb={4}
      p={3}
      borderRadius="full"
      bg={feedback.startsWith('✅') ? 'success-container' : feedback.startsWith('❌') ? 'error-container' : 'surface-container'}
      color={feedback.startsWith('✅') ? 'on-success-container' : feedback.startsWith('❌') ? 'on-error-container' : 'fg'}
      textStyle="body-md"
      fontWeight="medium"
    >
      {feedback}
    </Box>
  )
}
