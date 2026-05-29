import { Box, Heading, Text, VStack, HStack, Avatar, Badge, SimpleGrid, Divider } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiBookOpen, FiUser } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { teacherService } from '../../services/teacherService';

export default function ProfileSection() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    setLoadingSubjects(true);
    teacherService.getMyCourses()
      .then((res) => {
        const data = res.data || res || [];
        setSubjects(data);
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, []);

  if (!user) return <LoadingSkeleton variant="text" rows={3} />;

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Mi Perfil
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box p={6} borderRadius="card" bg="white" boxShadow="warmSm">
          <VStack align="center" spacing={4}>
            <Avatar
              size="2xl"
              name={`${user.first_name || ''} ${user.last_name || ''}`}
              bg="primary"
              color="white"
            />
            <Box textAlign="center">
              <Text fontSize="xl" fontWeight={700} fontFamily="heading">
                {user.first_name} {user.last_name}
              </Text>
              <Badge colorScheme="brand" mt={1} fontSize="sm">
                {user.role === 'docente' ? 'Docente' : user.role}
              </Badge>
            </Box>
          </VStack>
          <Divider my={4} />
          <VStack align="flex-start" spacing={3}>
            <HStack spacing={3}>
              <Box as={FiMail} color="onSurfaceVariant" />
              <Box>
                <Text fontSize="xs" color="onSurfaceVariant">Email</Text>
                <Text fontSize="sm">{user.email}</Text>
              </Box>
            </HStack>
            {user.phone && (
              <HStack spacing={3}>
                <Box as={FiPhone} color="onSurfaceVariant" />
                <Box>
                  <Text fontSize="xs" color="onSurfaceVariant">Teléfono</Text>
                  <Text fontSize="sm">{user.phone}</Text>
                </Box>
              </HStack>
            )}
            <HStack spacing={3}>
              <Box as={FiUser} color="onSurfaceVariant" />
              <Box>
                <Text fontSize="xs" color="onSurfaceVariant">Rol</Text>
                <Text fontSize="sm" textTransform="capitalize">{user.role}</Text>
              </Box>
            </HStack>
          </VStack>
        </Box>

        <Box p={6} borderRadius="card" bg="white" boxShadow="warmSm">
          <HStack spacing={3} mb={4}>
            <Box as={FiBookOpen} color="primary" boxSize={5} />
            <Heading as="h3" size="sm" fontFamily="heading">Materias Asignadas</Heading>
          </HStack>

          {loadingSubjects ? (
            <LoadingSkeleton variant="text" rows={3} />
          ) : subjects.length === 0 ? (
            <EmptyState
              title="Sin materias"
              description="No tiene materias asignadas. Contacte al administrador."
            />
          ) : (
            <VStack align="stretch" spacing={3}>
              {subjects.map((s, idx) => (
                <HStack
                  key={s.id || idx}
                  p={3}
                  borderRadius="input"
                  bg="containerLow"
                  sx={{ animation: 'fadeSlideIn 300ms ease-out both', animationDelay: `${idx * 50}ms` }}
                >
                  <Box w={2} h={2} borderRadius="full" bg="primary" />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight={500}>{s.name}</Text>
                    {s.course_name && (
                      <Text fontSize="xs" color="onSurfaceVariant">{s.course_name}</Text>
                    )}
                  </Box>
                  {s.schedule && (
                    <Badge fontSize="xs" colorScheme="brand" variant="subtle">{s.schedule}</Badge>
                  )}
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}
