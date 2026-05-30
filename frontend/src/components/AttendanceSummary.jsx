import { SimpleGrid, Box, Text, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

export default function AttendanceSummary({ totals }) {
  if (!totals) return null;

  const present = totals.present ?? totals.presentes ?? 0;
  const absent = totals.absent ?? totals.ausentes ?? totals.total_absences ?? 0;
  const late = totals.late ?? totals.tardes ?? 0;
  const justified = totals.justified ?? totals.justificadas ?? totals.justified_absences ?? 0;
  const totalDays = totals.totalDays ?? totals.total_days ?? totals.total ?? 0;
  const attendancePercent = totalDays > 0
    ? Math.round(((present + late) / totalDays) * 100)
    : 0;

  const cards = [
    { label: 'Presentes', value: present, color: 'success' },
    { label: 'Ausentes', value: absent, color: 'error' },
    { label: 'Tardes', value: late, color: 'amber' },
    { label: 'Justificadas', value: justified, color: 'blue.400' },
  ];

  return (
    <Box>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        {cards.map((card) => (
          <Box
            key={card.label}
            p={4}
            borderRadius="card"
            bg="white"
            boxShadow="warmSm"
            borderLeft="4px solid"
            borderColor={card.color}
          >
            <Stat>
              <StatLabel color="onSurfaceVariant" fontSize="sm">
                {card.label}
              </StatLabel>
              <StatNumber color={card.color} fontSize="2xl" fontWeight={700}>
                {card.value}
              </StatNumber>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>
      <Box
        p={4}
        borderRadius="card"
        bg="white"
        boxShadow="warmSm"
        textAlign="center"
      >
        <Text color="onSurfaceVariant" fontSize="sm">Asistencia total</Text>
        <Text
          fontSize="2xl"
          fontWeight={700}
          color={attendancePercent >= 80 ? 'success' : 'error'}
        >
          {attendancePercent}%
        </Text>
      </Box>
    </Box>
  );
}
