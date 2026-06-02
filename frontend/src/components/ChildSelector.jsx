import { Tabs, TabList, Tab, Box } from '@chakra-ui/react';
import CustomSelect from '../components/CustomSelect';

export default function ChildSelector({ children = [], selectedChild, onChange }) {
  if (!children || children.length === 0) return null;

  if (children.length <= 3) {
    return (
      <Box mb={4}>
        <Tabs
          variant="soft-rounded"
          colorScheme="brand"
          index={children.findIndex((c) => c.id === selectedChild?.id) || 0}
          onChange={(idx) => onChange(children[idx])}
        >
          <TabList>
            {children.map((child) => (
              <Tab key={child.id} borderRadius="pill">
                {child.first_name} {child.last_name}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <CustomSelect
        value={selectedChild?.id || ''}
        onChange={(val) => {
          const child = children.find((c) => c.id === parseInt(val));
          if (child) onChange(child);
        }}
      >
        <option value="">Seleccionar hijo...</option>
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.first_name} {child.last_name} - {child.course?.name || ''}
          </option>
        ))}
      </CustomSelect>
    </Box>
  );
}
