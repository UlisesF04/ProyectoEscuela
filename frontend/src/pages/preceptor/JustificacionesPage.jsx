import {
  Box, Heading, Button, Text, VStack, HStack, Badge, useToast, Card, CardBody,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiExternalLink, FiDownload } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { licencesService } from '../../services/licencesService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function JustificacionesPage() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchLicences = () => {
    setLoading(true);
    setError(null);
    licencesService.getFromParents()
      .then((data) => {
        const list = data?.data || data || [];
        setLicences(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLicences(); }, []);

  const columns = [
    {
      key: 'createdAt', label: 'Fecha',
      render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-AR') : '—',
    },
    {
      key: 'user', label: 'Padre',
      render: (r) => r.user ? `${r.user.first_name} ${r.user.last_name}` : '—',
    },
    {
      key: 'title', label: 'Motivo',
      render: (r) => r.title || '—',
    },
    {
      key: 'file', label: 'Archivo',
      render: (r) => r.has_file ? (
        <Button
          as="a"
          href={`${API_URL}/licences/${r.id}/download`}
          target="_blank"
          size="sm"
          variant="ghost"
          leftIcon={<FiExternalLink />}
          borderRadius="pill"
          _active={{ transform: 'scale(0.97)' }}
          transition="transform 160ms ease-out"
        >
          Ver
        </Button>
      ) : '—',
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchLicences} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Justificaciones de Padres
      </Heading>

      <DataTable
        columns={columns}
        data={licences}
        loading={loading}
        emptyMessage="No hay justificaciones de padres"
        emptyDescription="Los justificativos enviados por los padres aparecerán aquí."
      />
    </Box>
  );
}
