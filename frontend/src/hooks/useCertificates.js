import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

/**
 * Fetch and manage certificates.
 *
 * Returns {
 *   certificates, loading, error,
 *   upload, approve, reject,
 *   refetch
 * }
 */
export function useCertificates(params) {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(false) // page triggers loading via refetch()
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const load = async (queryParams) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/certificates', { params: queryParams })
      if (mountedRef.current) setCertificates(data.certificados || data.data || [])
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar certificados')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  // NOTE: No internal useEffect — the page controls fetching via refetch().
  // This avoids double-fetch on mount (page already calls refetch in its own useEffect).

  const refetch = (newParams) => load(newParams)

  const upload = async (formData) => {
    const { data } = await api.post('/certificates/upload', formData)
    return data
  }

  const approve = async (id) => {
    const { data } = await api.put(`/certificates/${id}/approve`)
    return data
  }

  const reject = async (id, comentario) => {
    const { data } = await api.put(`/certificates/${id}/reject`, { comentario })
    return data
  }

  return { certificates, loading, error, upload, approve, reject, refetch }
}
