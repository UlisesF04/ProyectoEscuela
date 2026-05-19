import { Flex, Text } from '@chakra-ui/react'

function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

/**
 * Circular avatar displaying the first letter of a name.
 *
 * Props:
 *   label     — string (required) — name to extract initial from
 *   size      — number            — box size in px (default 12)
 *   color     — string            — bg token (default 'primary-container')
 *   textColor — string            — color token (default 'on-primary-container')
 */
export default function Avatar({
  label,
  size = 12,
  color = 'primary-container',
  textColor = 'on-primary-container',
}) {
  return (
    <Flex
      w={size}
      h={size}
      borderRadius="full"
      bg={color}
      color={textColor}
      align="center"
      justify="center"
      fontWeight="bold"
      fontSize={typeof size === 'number' && size >= 10 ? 'lg' : 'sm'}
      flexShrink={0}
    >
      {getInitial(label)}
    </Flex>
  )
}
