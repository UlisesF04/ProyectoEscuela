import { Flex, Spinner, Text } from '@chakra-ui/react'

/**
 * Centered loading spinner.
 *
 * Props:
 *   py      — number (default 20) – vertical padding
 *   message — string (optional) – text shown below spinner
 *   size    — string (default 'lg') – Chakra Spinner size
 */
export default function LoadingSpinner({ py = 20, message, size = 'lg' }) {
  return (
    <Flex direction="column" justify="center" align="center" py={py} gap={3}>
      <Spinner size={size} />
      {message && (
        <Text textStyle="body-md" color="fg.muted">
          {message}
        </Text>
      )}
    </Flex>
  )
}
