import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Fetch students with their grades for a given course.
 * If cursoId is falsy, clears students and sets loading=false.
 *
 * Returns { students, loading, error, refetch }
 */
export function useGradeStudents(cursoId) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!cursoId) {
      setStudents([])
      setLoading(false)
      setError('')
      return []
    }

    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/grades/course/${cursoId}`)
      const est = data.estudiantes || []
      setStudents(est)
      return est
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar calificaciones')
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [cursoId])

  const refetch = () => load()

  return { students, loading, error, refetch }
}
