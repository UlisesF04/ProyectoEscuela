import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Button,
  Collapse,
  Icon,
  Avatar,
  HStack,
  Divider,
  Badge,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
} from 'react-icons/fi';

const roleLabels = {
  admin: { label: 'Administrador', color: 'purple.400' },
  preceptor: { label: 'Preceptor/a', color: 'teal.400' },
  docente: { label: 'Docente', color: 'orange.400' },
  padre: { label: 'Padre/Madre', color: 'pink.400' },
};

export default function DashboardLayout({ sections = [], role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);
  const cancelRef = useRef();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet) setCollapsed(true);
  }, [isTablet]);

  // Auto-expand on desktop
  useEffect(() => {
    if (!isMobile && !isTablet) setCollapsed(false);
  }, [isMobile, isTablet]);

  const roleInfo = roleLabels[user?.role] || { label: 'Usuario', color: 'gray.400' };
  const bgTint = '#FFF8F2';

  const handleLogout = () => {
    setLogoutAlertOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutAlertOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => {
    if (path === `/${role}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      {/* User info */}
      <VStack p={collapsed ? 3 : 4} spacing={3} align={collapsed ? 'center' : 'flex-start'}>
        <HStack spacing={3} w="full">
          <Avatar
            size="sm"
            name={`${user?.first_name} ${user?.last_name}`}
            bg={roleInfo.color}
          />
          <Collapse in={!collapsed} animateOpacity style={{ flex: 1, minWidth: 0 }}>
            <Box flex={1} minW={0}>
              <Text fontSize="sm" fontWeight={600} color="white" isTruncated>
                {user?.first_name} {user?.last_name}
              </Text>
              <Badge variant="subtle" colorScheme={roleInfo.color.split('.')[0]} fontSize="xs">
                {roleInfo.label}
              </Badge>
            </Box>
          </Collapse>
        </HStack>
      </VStack>

      <Divider borderColor="whiteAlpha.200" />

      {/* Navigation */}
      <VStack flex={1} p={2} spacing={1} align="stretch" overflowY="auto">
        {sections.map((section) => {
          const active = isActive(section.path);
          return (
            <Button
              key={section.id}
              variant="ghost"
              justifyContent={collapsed ? 'center' : 'flex-start'}
              leftIcon={section.icon ? <Icon as={section.icon} boxSize={5} /> : undefined}
              onClick={() => {
                navigate(section.path);
                if (isMobile) setMobileOpen(false);
              }}
              bg={active ? 'whiteAlpha.200' : 'transparent'}
              color={active ? 'white' : 'whiteAlpha.700'}
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              _active={{ transform: 'scale(0.97)' }}
              transition="all 160ms ease-out"
              h={10}
              px={collapsed ? 0 : 3}
              fontSize="sm"
              title={collapsed ? section.label : ''}
              borderRadius="pill"
            >
              {collapsed ? null : section.label}
            </Button>
          );
        })}
      </VStack>

      <Divider borderColor="whiteAlpha.200" />

      {/* Bottom actions */}
      <VStack p={2} spacing={1}>
        <Button
          variant="ghost"
          justifyContent={collapsed ? 'center' : 'flex-start'}
          leftIcon={<Icon as={FiLogOut} boxSize={5} />}
          onClick={handleLogout}
          color="whiteAlpha.600"
          _hover={{ bg: 'red.500', color: 'white' }}
          _active={{ transform: 'scale(0.97)' }}
          transition="all 160ms ease-out"
          w="full"
          h={10}
          px={collapsed ? 0 : 3}
          fontSize="sm"
          title={collapsed ? 'Cerrar sesión' : ''}
          borderRadius="pill"
        >
          {collapsed ? null : 'Cerrar sesión'}
        </Button>
      </VStack>
    </>
  );

  const sidebarWidth = collapsed ? '64px' : '280px';

  const renderContent = isMobile ? (
    <Box minH="100vh" bg={bgTint}>
      {/* Mobile header */}
      <Flex
        as="header"
        position="sticky"
        top={0}
        zIndex={99}
        bg="white"
        px={4}
        py={3}
        boxShadow="warmSm"
        align="center"
        justify="space-between"
      >
        <IconButton
          icon={<FiMenu />}
          variant="ghost"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          size="lg"
          minW="44px"
          minH="44px"
        />
        <Text fontSize="sm" fontWeight={600} color="onSurface">
          {sections.find((s) => isActive(s.path))?.label || 'Dashboard'}
        </Text>
        <Avatar
          size="sm"
          name={`${user?.first_name} ${user?.last_name}`}
          bg={roleInfo.color}
        />
      </Flex>

      <Drawer isOpen={mobileOpen} placement="left" onClose={() => setMobileOpen(false)}>
        <DrawerOverlay />
        <DrawerContent bg="#2D1B08" maxW="280px">
          {sidebarContent}
        </DrawerContent>
      </Drawer>

      <Box p={4}>
        <Outlet />
      </Box>
    </Box>
  ) : (
    <Flex minH="100vh" bg={bgTint}>
      {/* Sidebar */}
      <Box
        w={sidebarWidth}
        bg="#2D1B08"
        color="white"
        transition="width 200ms ease-out"
        display="flex"
        flexDirection="column"
        position="fixed"
        h="100vh"
        zIndex={100}
      >
        {/* Inner wrapper keeps content clipped while collapse button overflows */}
        <Box display="flex" flexDirection="column" h="100%" overflow="hidden">
          {sidebarContent}
        </Box>

        {!isMobile && (
          <IconButton
            icon={<Icon as={collapsed ? FiChevronRight : FiChevronLeft} boxSize={5} />}
            variant="ghost"
            size="xs"
            aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            onClick={() => setCollapsed(!collapsed)}
            position="absolute"
            right="-10px"
            top="50%"
            transform="translateY(-50%)"
            bg="#2D1B08"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="full"
            minW="28px"
            minH="28px"
            w="28px"
            h="28px"
            color="whiteAlpha.700"
            _hover={{ color: 'white', bg: '#3D2B18', borderColor: 'whiteAlpha.400' }}
            _active={{ transform: 'translateY(-50%) scale(0.95)' }}
            transition="all 160ms ease-out"
            zIndex={101}
            sx={{ boxShadow: '0 0 0 2px #2D1B08' }}
          />
        )}
      </Box>

      {/* Main content */}
      <Box
        ml={sidebarWidth}
        flex={1}
        transition="margin-left 200ms ease-out"
        minH="100vh"
        p={6}
      >
        <Outlet />
      </Box>
    </Flex>
  );

  return (
    <>
      {renderContent}

      {/* Confirm logout dialog - at root level for proper centering */}
      <AlertDialog
        isOpen={logoutAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setLogoutAlertOpen(false)}
      >
        <AlertDialogOverlay display="flex" alignItems="center" justifyContent="center" />
        <AlertDialogContent>
          <AlertDialogHeader fontFamily="heading" fontSize="lg">
            Cerrar sesión
          </AlertDialogHeader>
          <AlertDialogBody>
            ¿Está seguro de que desea cerrar sesión?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} variant="ghost" onClick={() => setLogoutAlertOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmLogout} ml={3}>
              Cerrar sesión
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
