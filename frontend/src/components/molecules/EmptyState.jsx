import { Box, Card, Text, VStack } from '@chakra-ui/react'

/**
 * Reusable empty state for lists and data views.
 *
 * Props:
 *   heading   — string (required)
 *   message   — string (required)
 *   icon      — string (optional, material-symbol name)
 *   action    — ReactNode (optional, e.g. <Button>)
 *   centered  — boolean (default true)
 */
export default function EmptyState({ heading, message, icon, action, centered = true }) {
  return (
    <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={8}>
      <VStack gap={3} textAlign={centered ? 'center' : 'left'}>
        {icon && (
          <Box
            as="span"
            className="material-symbols-outlined"
            fontSize="40px"
            color="fg.muted"
            opacity={0.5}
          >
            {icon}
          </Box>
        )}
        <Text textStyle="heading-md" color="fg.muted">
          {heading}
        </Text>
        <Text textStyle="body-md" color="fg.muted">
          {message}
        </Text>
        {action && <Box mt={2}>{action}</Box>}
      </VStack>
    </Card.Root>
  )
}
