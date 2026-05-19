import { Box } from '@chakra-ui/react'

const TREND_MAP = {
  up:      { icon: 'arrow_upward',    bg: 'success-container', color: 'success' },
  down:    { icon: 'arrow_downward',  bg: 'bg',                color: 'error' },
  neutral: { icon: 'horizontal_rule', bg: 'transparent',       color: 'fg.muted' },
}

/**
 * Small icon indicating an upward, downward, or neutral trend.
 *
 * Props:
 *   trend — 'up' | 'down' | 'neutral'
 */
export default function TrendIcon({ trend }) {
  const t = TREND_MAP[trend] || TREND_MAP.neutral
  return (
    <Box
      as="span"
      className="material-symbols-outlined"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w={8}
      h={8}
      borderRadius="full"
      bg={t.bg}
      color={t.color}
      fontSize="18px"
      lineHeight="1"
    >
      {t.icon}
    </Box>
  )
}
