'use client';

import { useState } from 'react';

function fieldStyle() {
  return {
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };
}

function label(text) {
  return (
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', marginTop: '0.9rem' }}>
      {text}
    </div>
  );
}

/**
 * Shared create/edit modal. `contentUnavailable` is true when we're editing
 * a draft whose full markdown couldn't be recovered from the backend (see
 * BlogTab's cache logic) — the form still opens, just with an empty content
 * field and a warning instead of silently losing the post's text.
 */
function BlogPostForm({ initialPost, contentUnavailable, onSubmit, onClose }) {
  const isEdit = Boolean(initialPost?.id);

  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [tagsInput, setTagsInput] = useState((initialPost?.tags || []).join(', '));
  const [author, setAuthor] = useState(initialPost?.author || 'Fabiola Ledesma');
  const [published, setPublished] = useState(initialPost?.published || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const body = isEdit
      ? { title, excerpt, coverImage, content, tags, author, published }
      : { title, slug: slug || undefined, excerpt, coverImage, content, tags, author, published };
    try {
      await onSubmit(body);
    } catch (err) {
      setError(err.message || 'No se pudo guardar la entrada.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(30,17,69,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1.5rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '1.75rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.3rem', color: 'var(--purple-900)', marginBottom: '0.25rem' }}>
          {isEdit ? 'Editar entrada' : 'Nueva entrada'}
        </h2>

        {contentUnavailable && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem', marginTop: '0.9rem', lineHeight: 1.5 }}>
            No se pudo recuperar el contenido completo de este borrador — el backend no lo expone fuera de esta sesión. Vuelve a pegarlo antes de guardar.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {label('Título')}
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle()} />

          {!isEdit && (
            <>
              {label('Slug (opcional — se genera solo si lo dejas vacío)')}
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} style={fieldStyle()} />
            </>
          )}

          {label('Extracto (opcional)')}
          <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={{ ...fieldStyle(), resize: 'vertical' }} />

          {label('URL de imagen de portada (opcional)')}
          <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} style={fieldStyle()} placeholder="https://…" />

          {label('Contenido (Markdown)')}
          <textarea
            rows={14}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...fieldStyle(), fontFamily: "'SF Mono', Menlo, monospace", fontSize: '0.8rem', resize: 'vertical' }}
          />

          {label('Tags (separados por coma)')}
          <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} style={fieldStyle()} placeholder="ux, carrera, portafolio" />

          {label('Autor')}
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} style={fieldStyle()} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-dark)', marginTop: '1rem' }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publicado
          </label>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.82rem', marginTop: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Guardando…' : published ? 'Publicar' : 'Guardar borrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlogPostForm;
