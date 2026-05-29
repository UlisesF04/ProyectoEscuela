import { Box, Flex, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { FiUsers, FiBookOpen, FiUserCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/courses'),
      api.get('/students'),
    ])
      .then(([users, courses, students]) => {
        setData({
          users: users.data?.data?.length || 0,
          courses: courses.data?.data?.length || 0,
          students: students.data?.data?.length || 0,
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton variant="card" rows={2} />;

  const cards = [
    { label: 'Usuarios Activos', value: data?.users ?? '—', color: 'primary', icon: FiUsers },
    { label: 'Cursos Activos', value: data?.courses ?? '—', color: 'secondary', icon: FiBookOpen },
    { label: 'Alumnos Registrados', value: data?.students ?? '—', color: 'success', icon: FiUserCheck },
  ];

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {cards.map((card) => (
          <Box
            key={card.label}
            p={6}
            borderRadius="card"
            bg="white"
            boxShadow="warm"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              h: '3px',
              bg: card.color,
              borderTopRadius: 'card',
            }}
          >
            <Flex align="center" mb={3} gap={2}>
              <Box as={card.icon} color={card.color} size="20px" />
            </Flex>
            <Stat>
              <StatLabel color="onSurfaceVariant">{card.label}</StatLabel>
              <StatNumber color={card.color} fontSize="3xl" fontWeight={700}>
                {card.value}
              </StatNumber>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
