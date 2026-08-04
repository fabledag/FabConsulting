import PaymentResult from '@/components/PaymentResult/index.jsx';
import { buildMetadata } from '@/lib/seo.js';

// Landing page for Mercado Pago's redirect. Noindex: it's a transactional
// screen, meaningless out of context and never a search result.
export const metadata = buildMetadata({
  title: 'Pago en proceso',
  description: 'Tu pago se está procesando.',
  path: '/pago/pendiente',
  noindex: true,
});

export default function Page() {
  return <PaymentResult variant="pendiente" />;
}
