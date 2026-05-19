import { Badge } from '@chakra-ui/react'

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente',  colorPalette: 'yellow' },
  aprobado:  { label: 'Aprobado',   colorPalette: 'green' },
  rechazado: { label: 'Rechazado',  colorPalette: 'red' },
}

/**
 * Badge that renders a human-readable label and colour for certificate statuses.
 *
 * Props:
 *   estado — 'pendiente' | 'aprobado' | 'rechazado'
 */
export default function StatusBadge({ estado }) {
  const cfg = STATUS_CONFIG[estado] || { label: estado, colorPalette: 'gray' }
  return (
    <Badge colorPalette={cfg.colorPalette} borderRadius="full" px={2}>
      {cfg.label}
    </Badge>
  )
}
