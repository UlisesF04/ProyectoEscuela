import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

/**
 * Fetch absence history for a student.
 *
 * Returns { data, loading, error, justify, refetch }
 */
export function useAbsenceHistory(studentId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const load = async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const { data: res } = await api.get(`/absences/student/${studentId}`)
      if (mountedRef.current) setData(res)
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar el historial')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [studentId])

  const justify = async (absenceId) => {
    const { data } = await api.patch(`/absences/${absenceId}/justify`)
    return data
  }

  return { data, loading, error, justify, refetch: load }
}
