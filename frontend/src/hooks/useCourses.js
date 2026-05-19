import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Fetch the list of courses on mount.
 * Returns { cursos, loading, error }
 */
export function useCourses() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await api.get('/courses')
        if (!cancelled) setCursos(data.cursos || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Error al cargar cursos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { cursos, loading, error }
}
