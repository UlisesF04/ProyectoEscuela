import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function GradeForm({ value, onChange, readOnly, subject, period, label }) {
  const [touched, setTouched] = useState(false);

  const displayValue = value ?? '';
  const numValue = parseFloat(value);
  const isInvalid = touched && (isNaN(numValue) || numValue < 0 || numValue > 10);

  const handleChange = (val) => {
    if (readOnly) return;
    setTouched(true);
    // Allow empty or partial input while typing
    if (val === '' || val === '-') {
      onChange(val);
      return;
    }
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
      onChange(val);
    }
  };

  return (
    <FormControl isInvalid={isInvalid} isReadOnly={readOnly}>
      {label && <FormLabel fontSize="sm" color="onSurfaceVariant">{label}</FormLabel>}
      <NumberInput
        value={displayValue}
        onChange={handleChange}
        min={0}
        max={10}
        step={0.01}
        precision={2}
        keepWithinRange={false}
        clampValueOnBlur={true}
        isReadOnly={readOnly}
        size="sm"
        w="120px"
      >
        <NumberInputField
          borderRadius="input"
          borderColor={isInvalid ? 'error' : 'outlineVariant'}
          _focus={{
            borderColor: 'primary',
            boxShadow: 'outline',
          }}
        />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      {subject && (
        <FormLabel fontSize="xs" color="onSurfaceVariant" mt={1}>
          {subject} {period ? `- ${period}` : ''}
        </FormLabel>
      )}
      <FormErrorMessage fontSize="xs">
        La nota debe estar entre 0 y 10
      </FormErrorMessage>
    </FormControl>
  );
}
