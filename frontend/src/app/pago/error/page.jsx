import PaymentResult from '@/components/PaymentResult/index.jsx';
import { buildMetadata } from '@/lib/seo.js';

// Landing page for Mercado Pago's redirect. Noindex: it's a transactional
// screen, meaningless out of context and never a search result.
export const metadata = buildMetadata({
  title: 'No se completó el pago',
  description: 'El pago no pudo completarse.',
  path: '/pago/error',
  noindex: true,
});

export default function Page() {
  return <PaymentResult variant="error" />;
}
