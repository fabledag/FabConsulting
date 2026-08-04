import Admin from '@/views/Admin/index.jsx';
import { buildMetadata } from '@/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Panel de administración',
  path: '/admin',
  noindex: true,
});

export default function AdminPage() {
  return <Admin />;
}
