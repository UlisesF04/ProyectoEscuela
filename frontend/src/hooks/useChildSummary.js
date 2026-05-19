import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

/**
 * Fetch a child's consolidated summary for the parent dashboard.
 *
 * Returns { summary, loading, error, refetch }
 */
export function useChildSummary(hijoId) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const load = async () => {
    if (!hijoId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/tutors/children/${hijoId}/summary`)
      if (mountedRef.current) setSummary(data)
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar resumen del alumno')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [hijoId])

  return { summary, loading, error, refetch: load }
}
