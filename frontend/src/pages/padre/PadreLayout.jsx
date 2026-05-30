import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiClock, FiFileText } from 'react-icons/fi';

const sections = [
  { id: 'grades', label: 'Calificaciones', icon: FiEdit3, path: '/padre/grades' },
  { id: 'attendances', label: 'Asistencias', icon: FiClock, path: '/padre/attendances' },
  { id: 'justificativos', label: 'Justificativos', icon: FiFileText, path: '/padre/justificativos' },
];

export default function PadreLayout() {
  return <DashboardLayout sections={sections} role="padre" />;
}
