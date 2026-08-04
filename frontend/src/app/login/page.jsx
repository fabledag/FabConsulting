import Login from '@/views/Login/index.jsx';
import { buildMetadata } from '@/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Entra a tu cuenta',
  description: 'Accede a tu cuenta para gestionar tus sesiones y tus créditos de Mentoría.',
  path: '/login',
  noindex: true,
});

export default function LoginPage() {
  return <Login />;
}
