import { useState, useEffect, useMemo } from 'react';
import {
  Badge,
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Stack,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Portal,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import EmptyState from './EmptyState';
import ErrorAlert from './ErrorAlert';

// ─── Helpers ────────────────────────────────────────────────────
const GRADE_TYPE_LABELS = {
  examen: 'Examen',
  trabajo: 'Trabajo Práctico',
  tarea: 'Tarea',
  oral: 'Oral',
  otro: 'Otro',
};

const GRADE_COLORS = {
  high: { bg: 'rgba(34, 139, 80, 0.12)', fg: '#1f6b3d', border: 'rgba(34, 139, 80, 0.3)' },     // >= 7
  mid:  { bg: 'rgba(217, 145, 38, 0.14)', fg: '#8a5a14', border: 'rgba(217, 145, 38, 0.35)' },  // 4 - 6.99
  low:  { bg: 'rgba(180, 50, 50, 0.12)', fg: '#8a2424', border: 'rgba(180, 50, 50, 0.32)' },     // < 4
};

const CHART_HEIGHT_PER_SUBJECT = 160;
const CHART_HEIGHT_GENERAL = 160;
const ACCENT_COLOR = '#7c2d12';

function gradeBand(value) {
  if (value === null || value === undefined) return 'mid';
  if (value >= 7) return 'high';
  if (value >= 4) return 'mid';
  return 'low';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // date comes as "YYYY-MM-DD" (DATEONLY)
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function trendIcon(grades) {
  if (grades.length < 2) return FiMinus;
  const first = grades[0].value;
  const last = grades[grades.length - 1].value;
  const diff = last - first;
  if (diff > 0.5) return FiTrendingUp;
  if (diff < -0.5) return FiTrendingDown;
  return FiMinus;
}

// Build a smooth Catmull-Rom spline through the points, expressed as a
// cubic Bezier path. Falls back to a straight line for 1-2 points.
function buildCatmullRomPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || points[i + 1];

    // Uniform Catmull-Rom with tension 0.5 (standard smooth curve through all points)
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// Extend a line path to close it at a baseline, creating an area-fill shape.
function buildAreaPath(linePath, points, baselineY) {
  if (points.length < 2) return '';
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

// Short date format for x-axis labels (dd/mm).
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

// ─── Custom tooltip for chart points ─────────────────────────
function GradeTooltip({ data }) {
  if (!data) return null;
  return (
    <Portal>
      <Box
        position="fixed"
        left={`${data.x + 12}px`}
        top={`${data.y - 10}px`}
        bg="rgba(45, 27, 8, 0.92)"
        color="white"
        borderRadius="8px"
        px={3}
        py={2}
        fontSize="xs"
        zIndex={9999}
        pointerEvents="none"
        whiteSpace="nowrap"
      >
        <Text fontWeight={600}>{data.value.toFixed(2)}</Text>
        <Text>{GRADE_TYPE_LABELS[data.type] || data.type} · {formatDate(data.date)}</Text>
        {data.description && <Text color="rgba(255,255,255,0.7)">{data.description}</Text>}
      </Box>
    </Portal>
  );
}

// ─── Sub-component: Smooth curve chart (Catmull-Rom + area fill) ─
function MiniLineChart({ grades, height = CHART_HEIGHT_PER_SUBJECT, accentColor = ACCENT_COLOR, gradientId = 'miniAreaFill', onGradeClick, subjectName }) {
  // ViewBox 400x160 (2.5:1) — renders proportional to a 160px-tall card chart
  const W = 400;
  const H = 160;
  const padXLeft = 24;
  const padXRight = 12;
  const padYTop = 16;
  const padYBottom = 28;
  const innerW = W - padXLeft - padXRight;
  const innerH = H - padYTop - padYBottom;
  const baselineYSvg = padYTop + innerH;
  const yMin = 0;
  const yMax = 10;

  const [animReady, setAnimReady] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const points = useMemo(() => {
    if (grades.length === 0) return [];
    return grades.map((g, i) => {
      const x = grades.length === 1
        ? padXLeft + innerW / 2
        : padXLeft + (i / (grades.length - 1)) * innerW;
      const y = padYTop + innerH - ((g.value - yMin) / (yMax - yMin)) * innerH;
      return { x, y, grade: g };
    });
  }, [grades, innerW, innerH]);

  if (points.length === 0) {
    return (
      <Box
        h={`${height}px`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="onSurfaceVariant"
        fontSize="sm"
      >
        Sin datos suficientes
      </Box>
    );
  }

  const linePathD = buildCatmullRomPath(points);
  const areaPathD = buildAreaPath(linePathD, points, baselineYSvg);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return (
    <Box w="full" position="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Gráfico de evolución de calificaciones"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
            <stop offset="60%" stopColor={accentColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {[2, 4, 6, 8, 10].map((tick) => {
          const y = padYTop + innerH - ((tick - yMin) / (yMax - yMin)) * innerH;
          return (
            <g key={tick}>
              <line
                x1={padXLeft}
                x2={W - padXRight}
                y1={y}
                y2={y}
                stroke="rgba(125, 90, 60, 0.08)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={padXLeft - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="rgba(125, 90, 60, 0.55)"
                fontFamily="inherit"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Baseline (y=0) */}
        <line
          x1={padXLeft}
          x2={W - padXRight}
          y1={baselineYSvg}
          y2={baselineYSvg}
          stroke="rgba(125, 90, 60, 0.25)"
          strokeWidth="1.5"
        />

        {/* Area fill under the curve */}
        <path
          d={areaPathD}
          fill={`url(#${gradientId})`}
          style={{
            opacity: animReady ? undefined : 0,
            transition: 'opacity 700ms cubic-bezier(0.23, 1, 0.32, 1) 700ms',
          }}
        />

        {/* Smooth curve with stroke-dashoffset transition */}
        <path
          d={linePathD}
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={animReady ? 0 : 100}
          style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(0.23, 1, 0.32, 1) 200ms' }}
        />

        {/* Data points with staggered fade-in */}
        {points.map((p, i) => {
          const band = gradeBand(p.grade.value);
          const fill = band === 'high' ? '#22c55e' : band === 'mid' ? '#d99126' : '#b83232';
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={i}
              style={{
                opacity: animReady ? 1 : 0,
                transition: `opacity 360ms cubic-bezier(0.23, 1, 0.32, 1) ${800 + i * 70}ms`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { setHoveredIdx(i); setTooltipData({ x: e.clientX, y: e.clientY, value: p.grade.value, type: p.grade.type, date: p.grade.date, description: p.grade.description }); }}
              onMouseMove={(e) => { setTooltipData(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null); }}
              onMouseLeave={() => { setHoveredIdx(null); setTooltipData(null); }}
              onClick={() => onGradeClick?.(p.grade)}
            >
              <circle
                cx={p.x} cy={p.y} r="11"
                fill={accentColor}
                fillOpacity="0.18"
                style={{ transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)', transform: isHovered ? 'scale(1.18)' : 'scale(1)', transformOrigin: `${p.x}px ${p.y}px` }}
              />
              <circle
                cx={p.x} cy={p.y} r="6.5"
                fill={fill} stroke="white" strokeWidth="2"
                style={{ transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)', transform: isHovered ? 'scale(1.18)' : 'scale(1)', transformOrigin: `${p.x}px ${p.y}px` }}
              />
            </g>
          );
        })}

        {/* Date labels */}
        {points.length >= 2 && (
          <>
            <text
              x={firstPoint.x}
              y={H - 8}
              textAnchor="start"
              fontSize="9"
              fill="rgba(125, 90, 60, 0.6)"
              fontFamily="inherit"
            >
              {formatDateShort(firstPoint.grade.date)}
            </text>
            <text
              x={lastPoint.x}
              y={H - 8}
              textAnchor="end"
              fontSize="9"
              fill="rgba(125, 90, 60, 0.6)"
              fontFamily="inherit"
            >
              {formatDateShort(lastPoint.grade.date)}
            </text>
          </>
        )}
      </svg>
      <GradeTooltip data={tooltipData} />
    </Box>
  );
}

// ─── Sub-component: General trend chart (one line, mean per date) ─
function GeneralTrendChart({ subjects, height = CHART_HEIGHT_GENERAL }) {
  // Aggregate all grades across all subjects by date, computing the mean per date
  const aggregated = useMemo(() => {
    const all = subjects.flatMap((s) =>
      (s.grades || []).map((g) => ({ date: g.date, value: g.value }))
    );
    if (all.length === 0) return [];
    const byDate = new Map();
    all.forEach(({ date, value }) => {
      if (!date) return;
      if (!byDate.has(date)) byDate.set(date, { sum: 0, count: 0 });
      const entry = byDate.get(date);
      entry.sum += value;
      entry.count += 1;
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { sum, count }]) => ({
        date,
        value: sum / count,
        count,
      }));
  }, [subjects]);

  const [animReady, setAnimReady] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const W = 600;
  const H = 160;
  const padXLeft = 28;
  const padXRight = 14;
  const padYTop = 18;
  const padYBottom = 28;
  const innerW = W - padXLeft - padXRight;
  const innerH = H - padYTop - padYBottom;
  const baselineYSvg = padYTop + innerH;
  const yMin = 0;
  const yMax = 10;

  if (aggregated.length === 0) return null;

  const totalGrades = aggregated.reduce((acc, p) => acc + p.count, 0);
  const firstDate = aggregated[0].date;
  const lastDate = aggregated[aggregated.length - 1].date;
  const firstPoint = aggregated[0];
  const lastPoint = aggregated[aggregated.length - 1];

  // Single point: show a centered dot only
  if (aggregated.length === 1) {
    const cx = padXLeft + innerW / 2;
    const cy = padYTop + innerH - ((aggregated[0].value - yMin) / (yMax - yMin)) * innerH;
    return (
      <Box
        bg="#FFFBF6"
        borderRadius="20px"
        p={4}
        border="1px solid"
        borderColor="rgba(125, 90, 60, 0.08)"
      >
        <HStack justify="space-between" mb={2}>
          <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>
            Promedio general
          </Text>
          <Text fontSize="xs" color="onSurfaceVariant">
            {formatDate(aggregated[0].date)} · {aggregated[0].count}{' '}
            {aggregated[0].count === 1 ? 'calificación' : 'calificaciones'}
          </Text>
        </HStack>
        <Box w="full">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} style={{ display: 'block' }} role="img" aria-label="Promedio general en una sola fecha">
            <defs>
              <linearGradient id="generalSingleFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.22" />
                <stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[2, 4, 6, 8, 10].map((tick) => {
              const y = padYTop + innerH - ((tick - yMin) / (yMax - yMin)) * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={padXLeft}
                    x2={W - padXRight}
                    y1={y}
                    y2={y}
                    stroke="rgba(125, 90, 60, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={padXLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="rgba(125, 90, 60, 0.55)"
                    fontFamily="inherit"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
            <line
              x1={padXLeft}
              x2={W - padXRight}
              y1={baselineYSvg}
              y2={baselineYSvg}
              stroke="rgba(125, 90, 60, 0.25)"
              strokeWidth="1.5"
            />
            <circle cx={cx} cy={cy} r="13" fill={ACCENT_COLOR} fillOpacity="0.18" />
            <circle cx={cx} cy={cy} r="7" fill={ACCENT_COLOR} stroke="white" strokeWidth="2" />
          </svg>
        </Box>
      </Box>
    );
  }

  // 2+ points: smooth curve + area fill
  const points = aggregated.map((g, i) => {
    const x = padXLeft + (i / (aggregated.length - 1)) * innerW;
    const y = padYTop + innerH - ((g.value - yMin) / (yMax - yMin)) * innerH;
    return { x, y, ...g };
  });

  const linePathD = buildCatmullRomPath(points);
  const areaPathD = buildAreaPath(linePathD, points, baselineYSvg);

  return (
    <Box
      bg="#FFFBF6"
      borderRadius="20px"
      p={4}
      border="1px solid"
      borderColor="rgba(125, 90, 60, 0.08)"
    >
      <HStack justify="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>
          Promedio general por fecha
        </Text>
        <HStack spacing={3} fontSize="xs" color="onSurfaceVariant">
          <Text>{formatDate(firstDate)}</Text>
          <Text aria-hidden="true">→</Text>
          <Text>{formatDate(lastDate)}</Text>
        </HStack>
      </HStack>

      <Box w="full" position="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={height}
          role="img"
          aria-label="Tendencia general del promedio de calificaciones a lo largo del tiempo"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="generalAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.22" />
              <stop offset="60%" stopColor={ACCENT_COLOR} stopOpacity="0.06" />
              <stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines */}
          {[2, 4, 6, 8, 10].map((tick) => {
            const y = padYTop + innerH - ((tick - yMin) / (yMax - yMin)) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={padXLeft}
                  x2={W - padXRight}
                  y1={y}
                  y2={y}
                  stroke="rgba(125, 90, 60, 0.08)"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
                <text
                  x={padXLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="rgba(125, 90, 60, 0.55)"
                  fontFamily="inherit"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Reference line at "approved" threshold (7) */}
          {(() => {
            const y = padYTop + innerH - ((7 - yMin) / (yMax - yMin)) * innerH;
            return (
              <line
                x1={padXLeft}
                x2={W - padXRight}
                y1={y}
                y2={y}
                stroke="rgba(34, 139, 80, 0.32)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })()}

          {/* Baseline (y=0) */}
          <line
            x1={padXLeft}
            x2={W - padXRight}
            y1={baselineYSvg}
            y2={baselineYSvg}
            stroke="rgba(125, 90, 60, 0.25)"
            strokeWidth="1.5"
          />

          {/* Area fill under the curve */}
          <path
            d={areaPathD}
            fill="url(#generalAreaFill)"
            style={{
              opacity: animReady ? undefined : 0,
              transition: 'opacity 800ms cubic-bezier(0.23, 1, 0.32, 1) 900ms',
            }}
          />

          {/* Smooth curve */}
          <path
            d={linePathD}
            fill="none"
            stroke={ACCENT_COLOR}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={animReady ? 0 : 100}
            style={{ transition: 'stroke-dashoffset 1300ms cubic-bezier(0.23, 1, 0.32, 1) 200ms' }}
          />

          {/* Data points with staggered fade-in */}
          {points.map((p, i) => {
            const band = gradeBand(p.value);
            const fill = band === 'high' ? '#22c55e' : band === 'mid' ? '#d99126' : '#b83232';
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                style={{
                  opacity: animReady ? 1 : 0,
                  transition: `opacity 360ms cubic-bezier(0.23, 1, 0.32, 1) ${1000 + i * 80}ms`,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { setHoveredIdx(i); setTooltipData({ x: e.clientX, y: e.clientY, value: p.value, type: 'promedio', date: p.date, description: `${p.count} ${p.count===1?'nota':'notas'}` }); }}
                onMouseMove={(e) => { setTooltipData(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null); }}
                onMouseLeave={() => { setHoveredIdx(null); setTooltipData(null); }}
              >
                <circle
                  cx={p.x} cy={p.y} r="12"
                  fill={ACCENT_COLOR} fillOpacity="0.18"
                  style={{ transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)', transform: isHovered ? 'scale(1.18)' : 'scale(1)', transformOrigin: `${p.x}px ${p.y}px` }}
                />
                <circle
                  cx={p.x} cy={p.y} r="7"
                  fill={fill} stroke="white" strokeWidth="2"
                  style={{ transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)', transform: isHovered ? 'scale(1.18)' : 'scale(1)', transformOrigin: `${p.x}px ${p.y}px` }}
                />
              </g>
            );
          })}

          {/* Date labels */}
          <text
            x={firstPoint.x}
            y={H - 8}
            textAnchor="start"
            fontSize="9"
            fill="rgba(125, 90, 60, 0.6)"
            fontFamily="inherit"
          >
            {formatDateShort(firstPoint.date)}
          </text>
          <text
            x={lastPoint.x}
            y={H - 8}
            textAnchor="end"
            fontSize="9"
            fill="rgba(125, 90, 60, 0.6)"
            fontFamily="inherit"
          >
            {formatDateShort(lastPoint.date)}
          </text>
        </svg>
      </Box>
      <GradeTooltip data={tooltipData} />

      <HStack justify="flex-end" mt={2} fontSize="xs" color="onSurfaceVariant">
        <Text>
          {aggregated.length} {aggregated.length === 1 ? 'fecha' : 'fechas'} · {totalGrades} calificaciones
        </Text>
      </HStack>
    </Box>
  );
}

// ─── Sub-component: Single subject card ─────────────────────────
function SubjectCard({ subject, index }) {
  const TrendIcon = trendIcon(subject.grades);
  const band = gradeBand(subject.average);
  const colors = GRADE_COLORS[band];
  const trendColor =
    subject.grades.length < 2
      ? '#8a5a14'
      : subject.grades[subject.grades.length - 1].value - subject.grades[0].value > 0.5
        ? '#1f6b3d'
        : subject.grades[subject.grades.length - 1].value - subject.grades[0].value < -0.5
          ? '#8a2424'
          : '#8a5a14';

  const [visible, setVisible] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedGrade, setSelectedGrade] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Box
      bg="white"
      borderRadius="32px"
      p={{ base: 4, md: 6 }}
      boxShadow="warmSm"
      border="1px solid"
      borderColor="rgba(125, 90, 60, 0.08)"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
        transition: 'opacity 480ms cubic-bezier(0.23, 1, 0.32, 1), transform 480ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <HStack justify="space-between" mb={4} align="flex-start" flexWrap="wrap" gap={2}>
        <VStack align="flex-start" spacing={1}>
          <Heading
            as="h3"
            fontSize={{ base: 'lg', md: 'xl' }}
            color="onSurface"
            fontWeight={600}
          >
            {subject.name}
          </Heading>
          <HStack spacing={1.5} color={trendColor} fontSize="sm">
            <Box as={TrendIcon} aria-hidden="true" />
            <Text>
              {subject.grades.length} {subject.grades.length === 1 ? 'calificación' : 'calificaciones'}
            </Text>
          </HStack>
        </VStack>
        <VStack align="flex-end" spacing={1}>
          <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.08em">
            Promedio
          </Text>
          <Box
            px={3}
            py={1.5}
            borderRadius="pill"
            bg={colors.bg}
            color={colors.fg}
            border="1px solid"
            borderColor={colors.border}
            fontWeight={700}
            fontSize="lg"
            lineHeight="1"
            minW="60px"
            textAlign="center"
          >
            {subject.average !== null ? subject.average.toFixed(2) : '—'}
          </Box>
        </VStack>
      </HStack>

      {/* Per-subject mini chart (prominent) */}
      <Box
        mb={4}
        bg="#FFFBF6"
        borderRadius="16px"
        p={3}
        border="1px solid"
        borderColor="rgba(125, 90, 60, 0.06)"
      >
        <MiniLineChart
          grades={subject.grades}
          height={CHART_HEIGHT_PER_SUBJECT}
          subjectName={subject.name}
          onGradeClick={(grade) => { setSelectedGrade(grade); onOpen(); }}
        />
      </Box>

      {/* Grade badges (chronological) */}
      <Box>
        <Text fontSize="xs" color="onSurfaceVariant" mb={2} textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>
          Detalle por fecha
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={2}>
          {subject.grades.map((g, i) => {
            const b = gradeBand(g.value);
            const c = GRADE_COLORS[b];
            return (
              <Tooltip
                key={g.id || i}
                label={`${GRADE_TYPE_LABELS[g.type] || g.type}: ${g.value.toFixed(2)} — ${formatDate(g.date)}${g.description ? ` — ${g.description}` : ''}`}
                placement="top"
                hasArrow
                bg="rgba(45, 27, 8, 0.92)"
                color="white"
                fontSize="xs"
                px={3}
                py={2}
                borderRadius="8px"
                openDelay={250}
              >
                <HStack
                  spacing={2}
                  p={2.5}
                  borderRadius="12px"
                  bg={c.bg}
                  border="1px solid"
                  borderColor={c.border}
                  cursor="default"
                  transition="transform 160ms cubic-bezier(0.23, 1, 0.32, 1)"
                  _hover={{ transform: 'translateY(-1px)' }}
                >
                  <Text fontWeight={700} color={c.fg} fontSize="md" minW="32px">
                    {g.value.toFixed(2)}
                  </Text>
                  <VStack align="flex-start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="xs" color={c.fg} fontWeight={600} isTruncated w="full">
                      {GRADE_TYPE_LABELS[g.type] || g.type}
                    </Text>
                    <Text fontSize="xs" color="onSurfaceVariant" isTruncated w="full">
                      {formatDate(g.date)}
                    </Text>
                  </VStack>
                </HStack>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay bg="rgba(0,0,0,0.4)" />
        <ModalContent bg="#FFFBF6" borderRadius="24px" p={2}>
          <ModalCloseButton color="#2D1B08" _hover={{ bg: 'rgba(125,90,60,0.1)' }} />
          <ModalHeader color="#2D1B08" fontSize="lg" fontWeight={700} pb={0}>
            Detalle de nota
          </ModalHeader>
          <ModalBody pb={6}>
            {selectedGrade && (
              <VStack align="stretch" spacing={3} mt={2}>
                <Box>
                  <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600} mb={0.5}>Materia</Text>
                  <Text fontSize="md" fontWeight={600} color="#2D1B08">{subject.name}</Text>
                </Box>
                <HStack spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600} mb={0.5}>Nota</Text>
                    <Text fontSize="2xl" fontWeight={700} color={gradeBand(selectedGrade.value) === 'high' ? '#1f6b3d' : gradeBand(selectedGrade.value) === 'mid' ? '#8a5a14' : '#8a2424'}>
                      {selectedGrade.value.toFixed(2)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600} mb={0.5}>Tipo</Text>
                    <Badge px={3} py={1.5} borderRadius="pill" fontSize="sm" colorScheme={selectedGrade.type === 'examen' ? 'orange' : selectedGrade.type === 'trabajo' ? 'blue' : selectedGrade.type === 'tarea' ? 'green' : selectedGrade.type === 'oral' ? 'purple' : 'gray'}>
                      {GRADE_TYPE_LABELS[selectedGrade.type] || selectedGrade.type}
                    </Badge>
                  </Box>
                </HStack>
                <Box>
                  <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600} mb={0.5}>Fecha</Text>
                  <Text fontSize="sm" color="#2D1B08">{formatDate(selectedGrade.date)}</Text>
                </Box>
                {selectedGrade.description && (
                  <Box>
                    <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600} mb={0.5}>Descripción</Text>
                    <Text fontSize="sm" color="#2D1B08" lineHeight="tall">{selectedGrade.description}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ─── Main component ─────────────────────────────────────────────
export default function GradeEvolutionView({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <Stack spacing={4}>
        <SkeletonText noOfLines={1} skeletonHeight="32px" width="60%" />
        <Skeleton height="200px" borderRadius="20px" />
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {[1, 2].map((i) => (
            <Box key={i} bg="white" borderRadius="32px" p={6} boxShadow="warmSm">
              <Skeleton height="24px" width="40%" mb={3} />
              <Skeleton height="160px" mb={3} borderRadius="16px" />
              <SimpleGrid columns={3} spacing={2}>
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
              </SimpleGrid>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (error) {
    return <ErrorAlert message="No se pudo cargar la evolución de calificaciones" onRetry={onRetry} />;
  }

  if (!data || !data.subjects || data.subjects.length === 0) {
    return (
      <EmptyState
        title="Sin calificaciones aún"
        description="Cuando se registren calificaciones para este estudiante, vas a ver su evolución acá."
        icon="📊"
      />
    );
  }

  const totalGrades = data.subjects.reduce((acc, s) => acc + s.grades.length, 0);
  const generalAverage = (() => {
    const allValues = data.subjects.flatMap((s) => s.grades.map((g) => g.value));
    if (allValues.length === 0) return null;
    return Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 100) / 100;
  })();

  return (
    <VStack align="stretch" spacing={6}>
      {/* Summary header */}
      <Box
        bg="white"
        borderRadius="32px"
        p={{ base: 4, md: 6 }}
        boxShadow="warmSm"
        border="1px solid"
        borderColor="rgba(125, 90, 60, 0.08)"
        style={{
          transition: 'opacity 380ms cubic-bezier(0.23, 1, 0.32, 1), transform 380ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <HStack justify="space-between" flexWrap="wrap" gap={3} mb={4}>
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.08em" fontWeight={600}>
              Evolución académica
            </Text>
            <Heading as="h2" fontSize={{ base: 'xl', md: '2xl' }} color="onSurface" fontWeight={700}>
              {data.student.first_name} {data.student.last_name}
            </Heading>
          </VStack>
          <HStack spacing={6} flexWrap="wrap">
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em">
                Materias
              </Text>
              <Text fontSize="2xl" fontWeight={700} color="onSurface" lineHeight="1">
                {data.subjects.length}
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em">
                Calificaciones
              </Text>
              <Text fontSize="2xl" fontWeight={700} color="onSurface" lineHeight="1">
                {totalGrades}
              </Text>
            </VStack>
            {generalAverage !== null && (
              <VStack align="flex-end" spacing={0}>
                <Text fontSize="xs" color="onSurfaceVariant" textTransform="uppercase" letterSpacing="0.06em">
                  Promedio general
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight={700}
                  lineHeight="1"
                  color={gradeBand(generalAverage) === 'high' ? '#1f6b3d' : gradeBand(generalAverage) === 'mid' ? '#8a5a14' : '#8a2424'}
                >
                  {generalAverage.toFixed(2)}
                </Text>
              </VStack>
            )}
          </HStack>
        </HStack>

        {/* Prominent general trend chart */}
        <GeneralTrendChart subjects={data.subjects} height={CHART_HEIGHT_GENERAL} />
      </Box>

      {/* Subject cards */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        {data.subjects.map((subject, idx) => (
          <SubjectCard key={subject.id} subject={subject} index={idx} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
