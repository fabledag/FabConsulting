import Profile from '@/views/Profile/index.jsx';
import { buildMetadata } from '@/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Tu perfil',
  description: 'Gestiona tus sesiones agendadas, tus créditos de Mentoría y tus notificaciones.',
  path: '/profile',
  noindex: true,
});

export default function ProfilePage() {
  return <Profile />;
}
