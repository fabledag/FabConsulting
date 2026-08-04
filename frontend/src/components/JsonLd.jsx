/**
 * Renders a JSON-LD structured-data block.
 *
 * This is a Server Component on purpose: Next serializes it into the exported
 * HTML at build time, which is precisely what makes the structured data visible
 * to crawlers that never execute JavaScript.
 */
function JsonLd({ schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default JsonLd;
