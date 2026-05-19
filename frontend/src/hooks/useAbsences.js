import { useState, useRef } from 'react'
import api from '../services/api'

/**
 * Load students by course+date and register absences.
 *
 * Returns {
 *   students, loading, error,
 *   loadStudents, registerAbsences,
 * }
 */
export function useAbsences() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const loadStudents = async (cursoId, fecha) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/absences/course/${cursoId}?fecha=${fecha}`)
      if (mountedRef.current) setStudents(data.estudiantes || [])
    } catch (err) {
      if (mountedRef.current) setError('Error al cargar alumnos')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  const registerAbsences = async ({ estudiante_ids, fecha, curso_id }) => {
    const { data } = await api.post('/absences/register', { estudiante_ids, fecha, curso_id })
    return data
  }

  return { students, loading, error, loadStudents, registerAbsences }
}
