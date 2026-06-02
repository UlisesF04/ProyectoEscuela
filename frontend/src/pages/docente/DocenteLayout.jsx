import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiCalendar, FiUser, FiTrendingUp, FiMessageSquare } from 'react-icons/fi';

const sections = [
  { id: 'grades', label: 'Calificaciones', icon: FiEdit3, path: '/docente/grades' },
  { id: 'evolution', label: 'Evolución del alumno', icon: FiTrendingUp, path: '/docente/evolution' },
  { id: 'leaves', label: 'Mis Licencias', icon: FiCalendar, path: '/docente/leaves' },
  { id: 'profile', label: 'Mi Perfil', icon: FiUser, path: '/docente/profile' },
  { id: 'chat', label: 'Chat Interno', icon: FiMessageSquare, path: '/docente/chat' },
];

export default function DocenteLayout() {
  return <DashboardLayout sections={sections} role="docente" />;
}
