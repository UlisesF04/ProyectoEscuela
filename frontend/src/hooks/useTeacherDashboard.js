import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { LOW_AVERAGE_UMBRAL, RECENT_TASKS_LIMIT } from '../constants/business'

/**
 * Fetch all dashboard data for a teacher (6 endpoints in parallel).
 *
 * Returns {
 *   cursos, absences, license,
 *   criticalGrades, lowAverage, recentTasks,
 *   loading, error, refetch
 * }
 */
export function useTeacherDashboard() {
  const [cursos, setCursos] = useState([])
  const [absences, setAbsences] = useState(null)
  const [license, setLicense] = useState(null)
  const [criticalGrades, setCriticalGrades] = useState([])
  const [lowAverage, setLowAverage] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [
        cursosRes,
        absencesRes,
        licenseRes,
        criticalRes,
        lowAvgRes,
        tasksRes,
      ] = await Promise.all([
        api.get('/courses'),
        api.get('/teachers/students/absences'),
        api.get('/teachers/license'),
        api.get('/grades/critical'),
        api.get(`/grades/low-average?umbral=${LOW_AVERAGE_UMBRAL}`),
        api.get('/tasks'),
      ])

      if (!mountedRef.current) return

      setCursos(cursosRes.data.cursos || [])
      setAbsences(absencesRes.data)
      setLicense(licenseRes.data)
      setCriticalGrades(criticalRes.data.data || [])
      setLowAverage(lowAvgRes.data.data || [])
      setRecentTasks((tasksRes.data.data || []).slice(0, RECENT_TASKS_LIMIT))
    } catch (err) {
      if (mountedRef.current) setError('Error al cargar datos del panel')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => { mountedRef.current = false }
  }, [])

  return {
    cursos, absences, license,
    criticalGrades, lowAverage, recentTasks,
    loading, error, refetch: load,
  }
}
