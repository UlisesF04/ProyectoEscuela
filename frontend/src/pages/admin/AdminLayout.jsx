import DashboardLayout from '../../components/DashboardLayout';
import ErrorBoundary from '../../components/ErrorBoundary';
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiUserCheck,
  FiUserPlus,
  FiCalendar,
  FiBell,
  FiSettings,
  FiMessageSquare,
} from 'react-icons/fi';

const sections = [
  { id: 'overview', label: 'Dashboard', icon: FiHome, path: '/admin' },
  { id: 'users', label: 'Usuarios', icon: FiUsers, path: '/admin/users' },
  { id: 'courses', label: 'Cursos', icon: FiBookOpen, path: '/admin/courses' },
  { id: 'students', label: 'Alumnos', icon: FiUserCheck, path: '/admin/students' },
  { id: 'assignments', label: 'Docentes', icon: FiUserPlus, path: '/admin/assignments' },
  { id: 'leaves', label: 'Licencias', icon: FiCalendar, path: '/admin/leaves' },
  { id: 'notifications', label: 'Notificaciones', icon: FiBell, path: '/admin/notifications' },
  { id: 'chat', label: 'Chat Interno', icon: FiMessageSquare, path: '/admin/chat' },
  { id: 'config', label: 'Configuración', icon: FiSettings, path: '/admin/config' },
];

export default function AdminLayout() {
  return (
    <ErrorBoundary homePath="/admin">
      <DashboardLayout sections={sections} role="admin" />
    </ErrorBoundary>
  );
}
