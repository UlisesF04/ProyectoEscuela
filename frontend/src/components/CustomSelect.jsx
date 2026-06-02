import { useCallback } from 'react';
import {
  Menu, MenuButton, MenuList, MenuItem,
  Button, Icon, Box,
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

export default function CustomSelect({
  value,
  onChange,
  placeholder = 'Seleccionar...',
  isDisabled = false,
  children,
  w,
  maxW,
  bg = 'white',
  ...rest
}) {
  const options = [];
  const childrenArray = Array.isArray(children) ? children : [children];
  childrenArray.forEach((child) => {
    if (child && typeof child === 'object' && 'props' in child) {
      options.push({
        value: child.props.value,
        label: child.props.children,
      });
    }
  });

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = useCallback((optValue) => {
    if (onChange) onChange(optValue);
  }, [onChange]);

  return (
    <Menu isLazy matchWidth>
      <MenuButton
        as={Button}
        isDisabled={isDisabled}
        variant="outline"
        w={w || maxW || 'full'}
        bg={bg}
        borderColor="outlineVariant"
        borderWidth="1px"
        borderRadius="input"
        textAlign="left"
        fontWeight="normal"
        fontSize="sm"
        color={selectedOption ? 'onSurface' : 'onSurfaceVariant'}
        rightIcon={<Icon as={FiChevronDown} boxSize={4} color="onSurfaceVariant" />}
        _hover={{ borderColor: 'primary' }}
        _expanded={{ borderColor: 'primary', boxShadow: 'outline' }}
        _focus={{ boxShadow: 'outline' }}
        px={4}
        h={10}
        transition="all 0.2s"
        {...rest}
      >
        <Box as="span" isTruncated display="block">
          {displayText}
        </Box>
      </MenuButton>
      <MenuList
        bg="white"
        borderRadius="card"
        boxShadow="warm"
        border="1px solid"
        borderColor="outlineVariant"
        py={1}
        px={1.5}
        minW="200px"
        zIndex="dropdown"
      >
        {options.length === 0 ? (
          <MenuItem isDisabled fontSize="sm" color="onSurfaceVariant">
            Sin opciones
          </MenuItem>
        ) : (
          options.map((opt) => (
            <MenuItem
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              bg={String(value) === String(opt.value) ? 'brand.50' : 'transparent'}
              color={String(value) === String(opt.value) ? 'primary' : 'onSurface'}
              fontWeight={String(value) === String(opt.value) ? 600 : 400}
              _hover={{ bg: 'gray.50' }}
              _focus={{ bg: 'brand.50' }}
              borderRadius="pill"
              fontSize="sm"
              px={4}
              py={2.5}
            >
              {opt.label}
            </MenuItem>
          ))
        )}
      </MenuList>
    </Menu>
  );
}
