import { Box, Flex, Text, NativeSelect, Spinner } from '@chakra-ui/react'

/**
 * Curso selector dropdown with loading state.
 *
 * Props:
 *   cursos        — array of { id, name }
 *   loading       — boolean — shows spinner while loading
 *   value         — string — currently selected cursoId
 *   onChange      — (cursoId: string) => void
 *   label         — string — field label (default 'Curso')
 *   placeholder   — string — placeholder text (default 'Seleccionar curso')
 *   size          — string — native select size (default 'lg')
 */
export default function CourseSelector({ cursos, loading, value, onChange, label = 'Curso', placeholder = 'Seleccionar curso', size = 'lg' }) {
  return (
    <Box>
      <Text textStyle="label-md" color="fg.muted" mb={1}>{label}</Text>
      {loading ? (
        <Flex align="center" gap={2} p={3}>
          <Spinner size="sm" />
          <Text textStyle="body-md" color="fg.muted">Cargando cursos...</Text>
        </Flex>
      ) : (
        <NativeSelect.Root size={size}>
          <NativeSelect.Field
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {cursos.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      )}
    </Box>
  )
}
