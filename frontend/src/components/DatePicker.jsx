import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Popover, PopoverTrigger, PopoverContent, PopoverBody,
  Button, HStack, IconButton, Text, SimpleGrid, Box, Flex,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const DAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function DatePicker({ value, onChange, placeholder = 'Seleccionar fecha', size = 'md', w, maxW, ...rest }) {
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [viewDate, setViewDate] = useState(parsedDate || new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (parsedDate) setViewDate(parsedDate);
  }, [parsedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month, firstDay, daysInMonth]);

  const displayValue = parsedDate
    ? parsedDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const handleDayClick = useCallback((day) => {
    const date = new Date(year, month, day);
    const formatted = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    if (onChange) onChange(formatted);
    setIsOpen(false);
  }, [year, month, onChange]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const formatted = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    if (onChange) onChange(formatted);
    setIsOpen(false);
  }, [onChange]);

  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day) =>
    parsedDate && day === parsedDate.getDate() && month === parsedDate.getMonth() && year === parsedDate.getFullYear();

  const btnSize = size === 'sm' ? 'sm' : 'md';
  const btnHeight = size === 'sm' ? 8 : 10;
  const btnFontSize = size === 'sm' ? 'xs' : 'sm';

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-start" isLazy>
      <PopoverTrigger>
        <Button
          variant="outline"
          w={w || maxW || 'full'}
          bg="white"
          borderColor="outlineVariant"
          borderWidth="1px"
          borderRadius="input"
          textAlign="left"
          fontWeight="normal"
          fontSize={btnFontSize}
          h={btnHeight}
          color={parsedDate ? 'onSurface' : 'onSurfaceVariant'}
          rightIcon={<Box as={FiCalendar} boxSize={4} color="onSurfaceVariant" />}
          _hover={{ borderColor: 'primary' }}
          _expanded={{ borderColor: 'primary', boxShadow: 'outline' }}
          _focus={{ boxShadow: 'outline' }}
          px={4}
          justifyContent="flex-start"
          transition="all 0.2s"
          onClick={() => setIsOpen(true)}
          {...rest}
        >
          <Box as="span" isTruncated display="block">
            {displayValue || placeholder}
          </Box>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        bg="white"
        borderRadius="card"
        boxShadow="warm"
        border="1px solid"
        borderColor="outlineVariant"
        w="auto"
        minW="260px"
        _focus={{ boxShadow: 'outline' }}
      >
        <PopoverBody p={3}>
          <Flex justify="space-between" align="center" mb={3}>
            <IconButton
              icon={<FiChevronLeft />}
              size="sm"
              variant="ghost"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              aria-label="Mes anterior"
              borderRadius="pill"
            />
            <Text fontFamily="heading" fontWeight={600} fontSize="sm">
              {MONTH_NAMES[month]} {year}
            </Text>
            <IconButton
              icon={<FiChevronRight />}
              size="sm"
              variant="ghost"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              aria-label="Mes siguiente"
              borderRadius="pill"
            />
          </Flex>

          <SimpleGrid columns={7} spacing={0} mb={1}>
            {DAY_NAMES.map((name) => (
              <Text
                key={name}
                textAlign="center"
                fontSize="xs"
                fontWeight={600}
                color="onSurfaceVariant"
                py={1}
              >
                {name}
              </Text>
            ))}
          </SimpleGrid>

          <SimpleGrid columns={7} spacing={1}>
            {calendarDays.map((day, idx) => (
              <Box key={idx} aspectRatio={1}>
                {day ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    w="full"
                    h="full"
                    minW={0}
                    minH={0}
                    p={0}
                    fontSize="sm"
                    borderRadius="pill"
                    fontWeight={isSelected(day) ? 600 : 400}
                    bg={isSelected(day) ? 'brand.50' : 'transparent'}
                    color={isSelected(day) ? 'primary' : isToday(day) ? 'primary' : 'onSurface'}
                    border={isToday(day) && !isSelected(day) ? '2px solid' : 'none'}
                    borderColor={isToday(day) && !isSelected(day) ? 'primary' : undefined}
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </Button>
                ) : (
                  <Box />
                )}
              </Box>
            ))}
          </SimpleGrid>

          <Flex justify="center" mt={2}>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="brand"
              borderRadius="pill"
              onClick={goToToday}
            >
              Hoy
            </Button>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
