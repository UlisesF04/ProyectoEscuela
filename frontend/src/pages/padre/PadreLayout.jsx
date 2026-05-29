import DashboardLayout from '../../components/DashboardLayout';
import { FiEdit3, FiClock, FiClipboard, FiUpload } from 'react-icons/fi';

const sections = [
  { id: 'grades', label: 'Calificaciones', icon: FiEdit3, path: '/padre/grades' },
  { id: 'attendances', label: 'Asistencias', icon: FiClock, path: '/padre/attendances' },
  { id: 'tasks', label: 'Tareas', icon: FiClipboard, path: '/padre/tasks' },
  { id: 'upload', label: 'Subir Certificado', icon: FiUpload, path: '/padre/upload-certificate' },
];

export default function PadreLayout() {
  return <DashboardLayout sections={sections} role="padre" />;
}
