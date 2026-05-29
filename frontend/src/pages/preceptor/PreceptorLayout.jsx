import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiClock, FiFileText } from 'react-icons/fi';

const sections = [
  { id: 'register', label: 'Registrar Asistencia', icon: FiEdit3, path: '/preceptor/attendance/register' },
  { id: 'history', label: 'Historial', icon: FiClock, path: '/preceptor/attendance/history' },
  { id: 'justify', label: 'Justificaciones', icon: FiFileText, path: '/preceptor/justify' },
];

export default function PreceptorLayout() {
  return <DashboardLayout sections={sections} role="preceptor" />;
}
