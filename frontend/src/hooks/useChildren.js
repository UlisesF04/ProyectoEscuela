import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Fetch the tutor's children on mount.
 * API returns { hijos: [...] }.
 *
 * Returns { hijos, loading, error }
 */
export function useChildren() {
  const [hijos, setHijos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await api.get('/tutors/children')
        if (!cancelled) setHijos(data.hijos || [])
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Error al cargar hijos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { hijos, loading, error }
}
