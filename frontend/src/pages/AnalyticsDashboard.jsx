import { useState } from 'react'
import { Box, Flex, Text, Button } from '@chakra-ui/react'

/* ── mock data ── */
const MOCK_SUBJECTS = [
  { id: 'all', label: 'Todas' },
  { id: 'mates', label: 'Matemáticas' },
  { id: 'lengua', label: 'Lengua' },
  { id: 'historia', label: 'Historia' },
  { id: 'bio', label: 'Biología' },
  { id: 'fisica', label: 'Física' },
  { id: 'quimica', label: 'Química' },
  { id: 'ef', label: 'Educación Física' },
]

const PERIODS = [
  { value: 'anual', label: 'Anual (Resumen)' },
  { value: 'trim1', label: 'Trimestre 1' },
  { value: 'trim2', label: 'Trimestre 2' },
  { value: 'trim3', label: 'Trimestre 3' },
]

const MONTHS = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago']

const MOCK_CHART_DATA = [60, 40, 55, 30, 45, 20] // percentages from top

const TABLE_DATA = [
  { subject: 'Matemáticas', avg: '8.5', trend: 'up', color: 'secondary-container' },
  { subject: 'Literatura', avg: '7.2', trend: 'up', color: 'primary-container' },
  { subject: 'Física', avg: '5.8', trend: 'down', color: 'error', critical: true },
  { subject: 'Química', avg: '3.5', trend: 'down', color: 'tertiary', danger: true },
  { subject: 'Educación Física', avg: '9.0', trend: 'neutral', color: 'outline' },
]

/* ── helper components ── */

function TrendIcon({ trend }) {
  const iconMap = {
    up: { icon: 'arrow_upward', bg: '#e8f5e9', color: '#2e7d32' },
    down: { icon: 'arrow_downward', bg: '#fff8f5', color: '#ba1a1a' },
    neutral: { icon: 'horizontal_rule', bg: 'transparent', color: '#594139' },
  }
  const t = iconMap[trend] || iconMap.neutral
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

/* ── chart component ── */

function TrendChart({ data, months }) {
  const w = 100
  const h = 100
  const points = data.map((p, i) => `${(i / (data.length - 1)) * w},${p}`).join(' ')
  const polygonPoints = `0,${h} 0,${data[0]} ${points} ${w},${h}`

  return (
    <Box w="full" h="72" position="relative" pt={4} pb={8} px={0}>
      {/* grid lines */}
      {[10, 8, 6, 4, 2].map((val, i) => {
        const y = ((10 - val) / 10) * 100
        const isLast = i === 4
        return (
          <Box
            key={val}
            position="absolute"
            left={0}
            right={0}
            top={`${y}%`}
            borderBottom={isLast ? '1px solid' : '1px dashed'}
            borderColor={isLast ? 'outline' : 'outline-variant'}
            opacity={isLast ? 1 : 0.5}
            pointerEvents="none"
          >
            <Text
              position="absolute"
              left={-5}
              top={-3}
              fontSize="xs"
              color="on-surface-variant"
              fontFamily="body"
            >
              {val}
            </Text>
          </Box>
        )
      })}

      {/* SVG line */}
      <Box as="svg" position="absolute" inset={0} w="full" h="full" pb={8} overflow="visible">
        <defs>
          <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ab3500" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#fff8f5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="#ab3500"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points={polygonPoints} fill="url(#chart-grad)" />
        {data.map((p, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * w}
            cy={p}
            r="2.5"
            fill="#ff6b35"
            stroke="#fff8f5"
            strokeWidth="1"
          />
        ))}
      </Box>

      {/* x-axis labels */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justify="space-between"
        px={0}
      >
        {months.map((m) => (
          <Text key={m} fontSize="xs" color="on-surface-variant" fontFamily="body">
            {m}
          </Text>
        ))}
      </Flex>
    </Box>
  )
}

/* ── main page ── */

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('grades')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [period, setPeriod] = useState('trim2')
  const [showAllSubjects, setShowAllSubjects] = useState(false)

  const subjects = showAllSubjects
    ? MOCK_SUBJECTS
    : [...MOCK_SUBJECTS.slice(0, 5), { id: '+more', label: `+${MOCK_SUBJECTS.length - 5} Más` }]

  return (
    <Flex direction="column" gap={6}>
      {/* ── Header + Tabs ── */}
      <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ lg: 'flex-end' }} gap={6}>
        <Box>
          <Text textStyle="heading-xl" color="on-surface" mb={1}>
            Tablero Analítico
          </Text>
          <Text textStyle="body-lg" color="on-surface-variant">
            Rendimiento académico global y tendencias por materia.
          </Text>
        </Box>

        {/* tab pill */}
        <Flex bg="surface-variant" p={1} borderRadius="full" alignSelf={{ base: 'flex-start', lg: 'auto' }}>
          <Button
            variant="ghost"
            borderRadius="full"
            bg={activeTab === 'grades' ? 'primary' : 'transparent'}
            color={activeTab === 'grades' ? 'on-primary' : 'on-surface-variant'}
            fontWeight={activeTab === 'grades' ? 'bold' : 'normal'}
            fontSize="sm"
            px={5}
            py={2}
            h="auto"
            minH="44px"
            _hover={{ bg: activeTab === 'grades' ? 'primary' : 'surface-container-high' }}
            transition="all 0.2s ease-out"
            onClick={() => setActiveTab('grades')}
            leftIcon={
              <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">
                trending_up
              </Box>
            }
          >
            EVOLUCIÓN DE NOTAS
          </Button>
          <Button
            variant="ghost"
            borderRadius="full"
            bg={activeTab === 'attendance' ? 'primary' : 'transparent'}
            color={activeTab === 'attendance' ? 'on-primary' : 'on-surface-variant'}
            fontWeight={activeTab === 'attendance' ? 'bold' : 'normal'}
            fontSize="sm"
            px={5}
            py={2}
            h="auto"
            minH="44px"
            _hover={{ bg: activeTab === 'attendance' ? 'primary' : 'surface-container-high' }}
            transition="all 0.2s ease-out"
            onClick={() => setActiveTab('attendance')}
            leftIcon={
              <Box as="span" className="material-symbols-outlined" fontSize="18px" lineHeight="1">
                calendar_month
              </Box>
            }
          >
            EVOLUCIÓN DE ASISTENCIAS
          </Button>
        </Flex>
      </Flex>

      {/* ── Filters Row ── */}
      <Box
        bg="surface"
        borderRadius="xl"
        p={6}
        boxShadow="warm-ambient"
        borderWidth="1px"
        borderColor="outline-variant"
      >
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          {/* subject chips */}
          <Box flex={2}>
            <Text textStyle="label-md" color="on-surface-variant" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Filtro por Materia
            </Text>
            <Flex wrap="wrap" gap={2}>
              {subjects.map((s) => {
                const isActive = selectedSubject === s.id
                const isMore = s.id === '+more'
                return (
                  <Button
                    key={s.id}
                    variant="ghost"
                    borderRadius="full"
                    fontSize="sm"
                    px={4}
                    py={1.5}
                    h="auto"
                    minH="32px"
                    bg={isActive ? 'primary' : isMore ? 'surface-variant' : 'tertiary-container'}
                    color={isActive ? 'on-primary' : isMore ? 'on-surface-variant' : 'on-tertiary-container'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                    _hover={{
                      bg: isActive ? 'primary' : isMore ? 'outline-variant' : undefined,
                      opacity: isActive ? 0.9 : undefined,
                    }}
                    transition="all 0.2s ease-out"
                    onClick={() => {
                      if (isMore) {
                        setShowAllSubjects(true)
                      } else {
                        setSelectedSubject(s.id)
                        setShowAllSubjects(false)
                      }
                    }}
                  >
                    {s.label}
                  </Button>
                )
              })}
            </Flex>
          </Box>

          {/* period selector */}
          <Box flex={1}>
            <Text textStyle="label-md" color="on-surface-variant" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Período Lectivo
            </Text>
            <Box position="relative">
              <Box
                as="select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                w="full"
                bg="surface-container-low"
                border="1px solid"
                borderColor="outline-variant"
                color="on-surface"
                fontFamily="body"
                fontSize="md"
                py={3}
                px={4}
                borderRadius="2xl"
                appearance="none"
                outline="none"
                cursor="pointer"
                transition="all 0.2s ease-out"
                _focus={{
                  ring: 2,
                  ringColor: 'primary',
                  borderColor: 'primary',
                }}
                sx={{
                  '&:focus': {
                    boxShadow: '0 0 0 2px #ab3500',
                    borderColor: '#ab3500',
                  },
                }}
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Box>
              <Box
                as="span"
                className="material-symbols-outlined"
                position="absolute"
                right={4}
                top="50%"
                transform="translateY(-50%)"
                color="on-surface-variant"
                pointerEvents="none"
                fontSize="20px"
              >
                expand_more
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* ── Chart Section ── */}
      <Box
        bg="surface"
        borderRadius="xl"
        p={6}
        boxShadow="warm-ambient"
        borderWidth="1px"
        borderColor="outline-variant"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text textStyle="heading-md" color="on-surface">
            Tendencia General de Calificaciones
          </Text>
          <Box
            as="span"
            bg="surface-container-high"
            color="on-surface-variant"
            fontSize="xs"
            fontWeight="semibold"
            fontFamily="body"
            px={3}
            py={1}
            borderRadius="full"
          >
            Escala 1-10
          </Box>
        </Flex>
        <TrendChart data={MOCK_CHART_DATA} months={MONTHS} />
      </Box>

      {/* ── Summary Table ── */}
      <Box
        bg="surface"
        borderRadius="xl"
        boxShadow="warm-ambient"
        borderWidth="1px"
        borderColor="outline-variant"
        overflow="hidden"
      >
        <Box bg="surface-container-low" borderBottom="1px solid" borderColor="outline-variant" px={6} py={4}>
          <Text textStyle="heading-md" color="on-surface">
            Resumen por Materia
          </Text>
        </Box>
        <Box overflowX="auto">
          <Box as="table" w="full" sx={{ borderCollapse: 'collapse' }}>
            <Box as="thead">
              <Box
                as="tr"
                borderBottom="1px solid"
                borderColor="outline-variant"
                bg="surface-container-highest"
              >
                <Box as="th" textStyle="label-md" color="on-surface-variant" textAlign="left" px={5} py={3.5}>
                  Materia
                </Box>
                <Box as="th" textStyle="label-md" color="on-surface-variant" textAlign="right" px={5} py={3.5}>
                  Promedio
                </Box>
                <Box as="th" textStyle="label-md" color="on-surface-variant" textAlign="center" px={5} py={3.5}>
                  Tendencia
                </Box>
              </Box>
            </Box>
            <Box as="tbody">
              {TABLE_DATA.map((row, i) => (
                <Box
                  as="tr"
                  key={row.subject}
                  borderBottom={i < TABLE_DATA.length - 1 ? '1px solid' : 'none'}
                  borderColor="outline-variant"
                  bg={row.critical ? 'error-container' : 'transparent'}
                  transition="background 0.15s ease"
                  _hover={{ bg: row.critical ? 'error-container' : 'surface-variant' }}
                >
                  <Box as="td" px={5} py={3.5}>
                    <Flex align="center" gap={3}>
                      <Box w={2} h={2} borderRadius="full" bg={row.color} flexShrink={0} />
                      <Text
                        color={row.critical ? 'on-error-container' : 'on-surface'}
                        fontWeight="medium"
                      >
                        {row.subject}
                      </Text>
                    </Flex>
                  </Box>
                  <Box as="td" px={5} py={3.5} textAlign="right">
                    {row.danger ? (
                      <Box
                        as="span"
                        bg="tertiary"
                        color="on-tertiary"
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontWeight="bold"
                        fontSize="sm"
                        display="inline-block"
                      >
                        {row.avg}
                      </Box>
                    ) : (
                      <Text
                        color={row.critical ? 'on-error-container' : 'on-surface'}
                        fontWeight="bold"
                      >
                        {row.avg}
                      </Text>
                    )}
                  </Box>
                  <Box as="td" px={5} py={3.5} textAlign="center">
                    <TrendIcon trend={row.trend} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Flex justify="center" px={6} py={4} bg="surface-container-lowest" borderTop="1px solid" borderColor="outline-variant">
          <Button
            variant="ghost"
            color="primary"
            fontSize="sm"
            fontWeight="semibold"
            fontFamily="body"
            _hover={{ textDecor: 'underline' }}
            transition="all 0.15s ease"
            rightIcon={
              <Box as="span" className="material-symbols-outlined" fontSize="16px">
                arrow_forward
              </Box>
            }
          >
            Ver detalle completo
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}
