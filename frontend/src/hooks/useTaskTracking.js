import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

/**
 * Fetch task detail and submissions for the tracking page.
 *
 * Returns { task, submissions, loading, error, updateSubmission, refetch }
 */
export function useTaskTracking(taskId) {
  const [task, setTask] = useState(null)
  const [submissions, setSubmissions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const load = async () => {
    if (!taskId) return
    setLoading(true)
    setError('')
    try {
      const [taskRes, subRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/tasks/${taskId}/submissions`),
      ])
      if (mountedRef.current) {
        setTask(taskRes.data)
        setSubmissions(subRes.data)
      }
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar datos de la tarea')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [taskId])

  const updateSubmission = async (studentId, entregada) => {
    const { data } = await api.put(`/tasks/${taskId}/students/${studentId}`, { entregada })
    return data
  }

  return { task, submissions, loading, error, updateSubmission, refetch: load }
}
