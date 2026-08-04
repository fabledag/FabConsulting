import PaymentResult from '@/components/PaymentResult/index.jsx';
import { buildMetadata } from '@/lib/seo.js';

// Landing page for Mercado Pago's redirect. Noindex: it's a transactional
// screen, meaningless out of context and never a search result.
export const metadata = buildMetadata({
  title: 'Pago recibido',
  description: 'Confirmación de tu pago y tu sesión.',
  path: '/pago/exito',
  noindex: true,
});

export default function Page() {
  return <PaymentResult variant="exito" />;
}
