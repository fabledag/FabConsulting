import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApiFetch } from '../../adminApi.js';
import { apiFetch } from '../../api.js';
import BlogPostForm from './BlogPostForm.jsx';

const FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Publicados' },
  { value: 'false', label: 'Borradores' },
];

function card(children) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
      {children}
    </div>
  );
}

function pillButton(danger = false) {
  return {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    padding: '0.4rem 0.9rem',
    fontSize: '0.78rem',
    color: danger ? '#b91c1c' : 'var(--purple-800)',
    cursor: 'pointer',
  };
}

function BlogTab({ onUnauthorized }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [publishedFilter, setPublishedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null); // null | 'new' | post object
  const [loadingContent, setLoadingContent] = useState(false);
  const cacheRef = useRef(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (publishedFilter) params.set('published', publishedFilter);
    try {
      const data = await adminApiFetch(`/admin/blog?${params.toString()}`);
      setPosts(data.posts || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudieron cargar las entradas.');
    } finally {
      setLoading(false);
    }
  }, [page, publishedFilter, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function openEdit(post) {
    if (cacheRef.current.has(post.id)) {
      setEditingPost(cacheRef.current.get(post.id));
      return;
    }
    if (post.published) {
      setLoadingContent(true);
      try {
        const data = await apiFetch(`/blog/${post.slug}`);
        const full = { ...post, content: data.post.content };
        cacheRef.current.set(post.id, full);
        setEditingPost(full);
      } catch {
        setEditingPost(post);
      } finally {
        setLoadingContent(false);
      }
      return;
    }
    setEditingPost(post);
  }

  async function handleFormSubmit(body) {
    const now = new Date().toISOString();
    try {
      if (editingPost === 'new') {
        const data = await adminApiFetch('/admin/blog', { method: 'POST', body });
        setPosts((prev) => [data.post, ...prev]);
        cacheRef.current.set(data.post.id, data.post);
      } else {
        const id = editingPost.id;
        await adminApiFetch(`/admin/blog/${id}`, { method: 'PUT', body });
        mergePost(id, body, now);
      }
      setEditingPost(null);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      throw err;
    }
  }

  function mergePost(id, fields, now) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const publishedAt =
          fields.published === true ? p.publishedAt || now : fields.published === false ? null : p.publishedAt;
        return { ...p, ...fields, publishedAt, updatedAt: now };
      })
    );
    cacheRef.current.set(id, { ...(cacheRef.current.get(id) || {}), ...fields, id });
  }

  async function handleQuickToggle(post) {
    setError('');
    const nextPublished = !post.published;
    try {
      await adminApiFetch(`/admin/blog/${post.id}`, { method: 'PUT', body: { published: nextPublished } });
      mergePost(post.id, { published: nextPublished }, new Date().toISOString());
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo actualizar la entrada.');
    }
  }

  async function handleDelete(post) {
    if (!window.confirm(`¿Eliminar la entrada "${post.title}"? No se puede deshacer.`)) return;
    setError('');
    try {
      await adminApiFetch(`/admin/blog/${post.id}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      cacheRef.current.delete(post.id);
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message || 'No se pudo eliminar la entrada.');
    }
  }

  const contentUnavailable =
    editingPost && editingPost !== 'new' && editingPost.content === undefined;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <select
          value={publishedFilter}
          onChange={(e) => {
            setPage(1);
            setPublishedFilter(e.target.value);
          }}
          style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={() => setEditingPost('new')} style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem' }}>
          + Nueva entrada
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando…</p>}
      {!loading && posts.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay entradas con este filtro.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {posts.map((p) =>
          card(
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {p.coverImage && (
                  <img src={p.coverImage} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    /{p.slug} · {(p.tags || []).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: p.published ? '#166534' : 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                    {p.published ? 'Publicado' : 'Borrador'} · actualizado {p.updatedAt?.slice(0, 10)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <button style={pillButton()} onClick={() => openEdit(p)} disabled={loadingContent}>Editar</button>
                <button style={pillButton()} onClick={() => handleQuickToggle(p)}>
                  {p.published ? 'Despublicar' : 'Publicar'}
                </button>
                <button style={pillButton(true)} onClick={() => handleDelete(p)}>Eliminar</button>
              </div>
            </div>
          )
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
          <button style={pillButton()} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Página {pagination.page} de {pagination.pages}
          </span>
          <button style={pillButton()} disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
        </div>
      )}

      {editingPost && (
        <BlogPostForm
          initialPost={editingPost === 'new' ? null : editingPost}
          contentUnavailable={contentUnavailable}
          onSubmit={handleFormSubmit}
          onClose={() => setEditingPost(null)}
        />
      )}
    </div>
  );
}

export default BlogTab;
