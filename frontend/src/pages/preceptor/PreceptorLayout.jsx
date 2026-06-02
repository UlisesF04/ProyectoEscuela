import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiClock, FiFileText, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const sections = [
  { id: 'register', label: 'Registrar Asistencia', icon: FiEdit3, path: '/preceptor/attendance/register' },
  { id: 'history', label: 'Historial', icon: FiClock, path: '/preceptor/attendance/history' },
  { id: 'justify', label: 'Justificaciones', icon: FiFileText, path: '/preceptor/justify' },
  { id: 'leaves', label: 'Mis Licencias', icon: FiCalendar, path: '/preceptor/leaves' },
  { id: 'chat', label: 'Chat Interno', icon: FiMessageSquare, path: '/preceptor/chat' },
];

export default function PreceptorLayout() {
  return <DashboardLayout sections={sections} role="preceptor" />;
}
