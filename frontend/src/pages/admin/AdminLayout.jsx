import DashboardLayout from '../../components/DashboardLayout';
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiUserCheck,
  FiUserPlus,
  FiLink,
  FiCalendar,
  FiBell,
  FiSettings,
} from 'react-icons/fi';

const sections = [
  { id: 'overview', label: 'Dashboard', icon: FiHome, path: '/admin' },
  { id: 'users', label: 'Usuarios', icon: FiUsers, path: '/admin/users' },
  { id: 'courses', label: 'Cursos', icon: FiBookOpen, path: '/admin/courses' },
  { id: 'students', label: 'Alumnos', icon: FiUserCheck, path: '/admin/students' },
  { id: 'assignments', label: 'Asignaciones', icon: FiUserPlus, path: '/admin/assignments' },
  { id: 'links', label: 'Vínculos', icon: FiLink, path: '/admin/links' },
  { id: 'leaves', label: 'Licencias', icon: FiCalendar, path: '/admin/leaves' },
  { id: 'notifications', label: 'Notificaciones', icon: FiBell, path: '/admin/notifications' },
  { id: 'config', label: 'Configuración', icon: FiSettings, path: '/admin/config' },
];

export default function AdminLayout() {
  return <DashboardLayout sections={sections} role="admin" />;
}
