import {
  Box, Heading, Button, Text, VStack, HStack, Badge, useToast, Card, CardBody,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { licencesService } from '../../services/licencesService';

export default function JustificacionesPage() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  async function handleDownload(id, fileName) {
    try {
      const response = await licencesService.download(id);
      const contentType = response.headers['content-type'];
      if (!contentType || (!contentType.startsWith('application/') && !contentType.startsWith('image/'))) {
        throw new Error('Tipo de archivo inesperado');
      }
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'justificacion';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: 'Error al descargar',
        description: 'No se pudo descargar el archivo',
        status: 'error', duration: 3000, isClosable: true, position: 'top-right',
      });
    }
  }

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
          size="sm"
          variant="ghost"
          leftIcon={<FiDownload />}
          borderRadius="pill"
          onClick={() => handleDownload(r.id, r.file_name || 'justificacion')}
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
