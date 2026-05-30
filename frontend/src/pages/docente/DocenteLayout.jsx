import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiCalendar, FiUser } from 'react-icons/fi';

const sections = [
  { id: 'grades', label: 'Calificaciones', icon: FiEdit3, path: '/docente/grades' },
  { id: 'leaves', label: 'Mis Licencias', icon: FiCalendar, path: '/docente/leaves' },
  { id: 'profile', label: 'Mi Perfil', icon: FiUser, path: '/docente/profile' },
];

export default function DocenteLayout() {
  return <DashboardLayout sections={sections} role="docente" />;
}
