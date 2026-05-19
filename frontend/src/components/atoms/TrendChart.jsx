import { Box, Flex, Text } from '@chakra-ui/react'
import { MIN_CHART_DATA_POINTS, CHART_SVG_WIDTH, CHART_SVG_HEIGHT } from '../../constants/business'

/**
 * SVG line chart with grid, gradient fill, and date labels.
 *
 * Props:
 *   data       — number[] — Y values (0–10 scale)
 *   months     — string[] — X-axis labels (same length as data)
 *   color      — string   — SVG stroke / fill color (default '#ab3500')
 *   gradientId — string   — unique gradient ID for inline defs (default 'chart-grad')
 */
export default function TrendChart({ data, months, color = '#ab3500', gradientId = 'chart-grad' }) {
  if (!data || data.length < MIN_CHART_DATA_POINTS) {
    return (
      <Text textStyle="body-md" color="fg.muted" py={8} textAlign="center">
        Datos insuficientes para gráfico
      </Text>
    )
  }

  const w = CHART_SVG_WIDTH
  const h = CHART_SVG_HEIGHT
  const toY = (val) => h - (val / 10) * h  // normalize grade 0-10 → SVG Y 100-0
  const pts = data.map((p, i) => `${(i / (data.length - 1)) * w},${toY(p)}`).join(' ')
  const polyPts = `0,${h} 0,${toY(data[0])} ${pts} ${w},${h}`

  return (
    <Box w="full" h="72" position="relative" pt={4} pb={8} px={0}>
      {/* grid */}
      {[10, 8, 6, 4, 2].map((val) => {
        const y = ((10 - val) / 10) * 100
        return (
          <Box
            key={val}
            position="absolute"
            left={0}
            right={0}
            top={`${y}%`}
            borderBottom={val === 2 ? '1px solid' : '1px dashed'}
            borderColor="border.default"
            opacity={val === 2 ? 1 : 0.4}
            pointerEvents="none"
          >
            <Text position="absolute" left={-5} top={-3} fontSize="xs" color="fg.muted">
              {val}
            </Text>
          </Box>
        )
      })}

      <Box as="svg" position="absolute" inset={0} w="full" h="full" pb={8} overflow="visible">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={polyPts} fill={`url(#${gradientId})`} />
        {data.map((p, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * w}
            cy={toY(p)}
            r="2.5"
            fill={color}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </Box>

      <Flex position="absolute" bottom={0} left={0} right={0} justify="space-between" px={0}>
        {months.map((m) => (
          <Text key={m} fontSize="xs" color="fg.muted">
            {m}
          </Text>
        ))}
      </Flex>
    </Box>
  )
}
