import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Fetch subjects (materias), optionally filtered by course.
 * The API returns { data: [{ materia_id, materia, curso }] } and we map to { id, nombre }.
 * Pass cursoId to filter client-side; omit to load all subjects.
 *
 * Returns { materias, loading, refetch }
 */
export function useSubjects(cursoId) {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get('/grades/subjects')
      let list = (res.data || []).map(s => ({ id: s.materia_id, nombre: s.materia }))
      if (cursoId) {
        list = list.filter(s => s.curso === cursoId || !s.curso)
      }
      setMaterias(list)
      return list
    } catch {
      setMaterias([])
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [cursoId])

  return { materias, loading, refetch: load }
}
