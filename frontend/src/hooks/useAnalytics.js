import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Fetch full analytics data for a student by ID.
 * Fetches only when studentId is truthy.
 *
 * Returns { data, loading, error, refetch }
 */
export function useAnalytics(studentId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const { data: result } = await api.get(`/analytics/student/${studentId}`)
      setData(result)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos del estudiante')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [studentId])

  return { data, loading, error, refetch: load }
}
