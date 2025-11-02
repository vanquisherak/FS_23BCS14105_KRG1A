import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';

function ReviewForm({ bookId, onAdded }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  async function submit(e){
    e.preventDefault();
    if (submitting) return;
    setErrors({});
    setApiError('');
    if (!title || title.trim().length === 0) return setErrors({ title: 'Title required' });
    if (title.length > 200) return setErrors({ title: 'Title too long' });
    if (body.length > 2000) return setErrors({ body: 'Body too long' });
    try {
      setSubmitting(true);
      await api.post(`/books/${bookId}/reviews`, { rating, title, body });
      setTitle(''); setBody(''); setRating(5);
      onAdded();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="text-xs uppercase tracking-[0.3em] text-slate/60 mb-1 block">rating</label>
          <select
            value={rating}
            onChange={e=>setRating(Number(e.target.value))}
            disabled={submitting}
            className="input-field appearance-none pr-10"
          >
            {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate/60 mb-1 block">title</label>
          <input
            placeholder="Electric, tender, unforgettable…"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            disabled={submitting}
            className="input-field"
          />
          {errors.title && <p className="mt-2 text-xs text-rose-400">{errors.title}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-slate/60 mb-1 block">body</label>
        <textarea
          placeholder="Tell the rebels what resonated. Be specific, be vivid."
          value={body}
          onChange={e=>setBody(e.target.value)}
          disabled={submitting}
          className="input-field min-h-[160px] resize-y"
        />
        {errors.body && <p className="mt-2 text-xs text-rose-400">{errors.body}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button
          disabled={submitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting…' : 'Post review'}
        </button>
        {apiError ? <p className="text-xs text-rose-400">{apiError}</p> : null}
      </div>
    </form>
  );
}

export default function BookDetails(){
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { user } = useContext(AuthContext);
  const [deletingId, setDeletingId] = useState(null);

  async function load(){
    const res = await api.get(`/books/${id}`);
    setBook(res.data.book);
    setReviews(res.data.reviews);
  }

  useEffect(()=>{ load() }, [id]);

  if (!book) return <div>Loading...</div>
  return (
    <div>
      <h2>{book.title}</h2>
      {user?.isAdmin ? <p><a href={`/admin/books/${id}/edit`}>Edit book (admin)</a></p> : null}
      <p>Author: {book.author}</p>
      <p>Average Rating: {book.averageRating?.toFixed?.(1) || '—'}</p>
      <p>{book.description}</p>
      <h3>Reviews</h3>
      <ul>
        {reviews.map(r=> (
          <li key={r._id} style={{ marginBottom: 12 }}>
            <strong>{r.user?.name}</strong>: {r.rating} — <em>{r.title}</em>
            <div>{r.body}</div>
            <small>
              {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
              {r.updatedAt && r.updatedAt !== r.createdAt ? ' · Edited ' + new Date(r.updatedAt).toLocaleString() : ''}
            </small>
            {/* actions: edit/delete for owner, delete for admin */}
            {user && user._id === r.user?._id ? (
              <ReviewEditor review={r} onSaved={load} />
            ) : null}
            {user && (user._id === r.user?._id || user.isAdmin) ? (
              <div>
                <button
                  type="button"
                  onClick={async (e)=>{
                    e.preventDefault();
                    if (deletingId) return;
                    if(!confirm('Delete review?')) return;
                    setDeletingId(r._id);
                    try {
                      await api.delete(`/reviews/${r._id}`);
                      load();
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                  disabled={Boolean(deletingId)}
                >{deletingId === r._id ? 'Deleting…' : 'Delete'}</button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div id="review-form" className="mt-8">
        {user ? <ReviewForm bookId={id} onAdded={load} /> : <p>Login to post reviews</p>}
      </div>
    </div>
  )
}

function ReviewEditor({ review, onSaved }){
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(review.title || '');
  const [body, setBody] = useState(review.body || '');
  const [rating, setRating] = useState(review.rating || 5);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    setTitle(review.title || '');
    setBody(review.body || '');
    setRating(review.rating || 5);
  }, [review._id, review.title, review.body, review.rating]);

  async function save(e){
    e.preventDefault();
    if (saving) return;
    setErrors({});
    if (!title || title.trim().length===0) return setErrors({ title: 'Title required' });
    try{
      setSaving(true);
  await api.put(`/reviews/${review._id}`, { rating, title, body });
      setEditing(false);
      onSaved();
    } catch (err){
      setErrors({ api: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!editing) return (<div><button type="button" onClick={(e)=>{e.preventDefault(); setEditing(true);}}>Edit</button></div>);
  return (
    <form onSubmit={save} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate/60 mb-1 block">rating</label>
          <select
            value={rating}
            onChange={e=>setRating(Number(e.target.value))}
            disabled={saving}
            className="input-field appearance-none pr-10"
          >
            {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate/60 mb-1 block">title</label>
          <input
            value={title}
            onChange={e=>setTitle(e.target.value)}
            disabled={saving}
            className="input-field"
          />
          {errors.title && <p className="mt-2 text-xs text-rose-400">{errors.title}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-slate/60 mb-1 block">body</label>
        <textarea
          value={body}
          onChange={e=>setBody(e.target.value)}
          disabled={saving}
          className="input-field min-h-[160px] resize-y"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={(e)=>{e.preventDefault(); setEditing(false); setErrors({});}}
          disabled={saving}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        {errors.api && <p className="text-xs text-rose-400">{errors.api}</p>}
      </div>
    </form>
  );
}
