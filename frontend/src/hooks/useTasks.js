import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

/**
 * Fetch all tasks on mount.
 * API returns { data: [...] }.
 * Also exposes refetch() for manual refresh after mutations.
 *
 * Returns { tasks, loading, error, refetch }
 */
export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: res } = await api.get('/tasks')
      if (mountedRef.current) setTasks(res.data || [])
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar tareas')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [])

  return { tasks, loading, error, refetch: load }
}
