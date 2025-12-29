import { useEffect, useMemo, useState } from 'react'
import './App.css'

const BACKEND_URL = 'https://blog-backend-2-nmng.onrender.com'
const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api/posts`

const initialForm = {
  title: '',
  author: '',
  content: '',
}

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    void fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL)
      if (!res.ok) {
        throw new Error('Failed to load posts')
      }
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      setError(err.message || 'Unable to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const url = editingId ? `${API_URL}/${editingId}` : API_URL
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const message = editingId ? 'Unable to update post' : 'Unable to create post'
        throw new Error(message)
      }

      await fetchPosts()
      resetForm()
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Unable to delete post')
      }
      setPosts((prev) => prev.filter((post) => post.id !== id))
      if (editingId === id) {
        resetForm()
      }
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  const heroCopy = useMemo(
    () => ({
      title: editingId ? 'Update your blog post' : 'Create a new blog post',
      cta: editingId ? 'Update post' : 'Publish post',
    }),
    [editingId],
  )

  return (
    <div className="app-shell">
      <header className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#38bdf8_0,#0f172a_25%,#0f172a_60%),radial-gradient(circle_at_80%_10%,#a5b4fc_0,#0f172a_30%,#0f172a_65%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              MERN Blog Studio
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Publish beautifully crafted posts in minutes.
            </h1>
            <p className="text-slate-200">
              Create, edit, and delete articles with a React + Tailwind front end powered by a Node/Express API.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
                Live preview
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
                CRUD API
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
                Tailwind UI
              </span>
            </div>
          </div>
          <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm text-slate-100 shadow-lg shadow-sky-900/30 sm:block">
            <p className="font-semibold text-white">Quick start</p>
            <ol className="mt-2 space-y-1 text-slate-200">
              <li>1) Run backend: npm run dev</li>
              <li>2) Run frontend: npm run dev</li>
              <li>3) Add your first post below</li>
            </ol>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-indigo-700"
          >
            {editingId ? 'Edit blog post' : showForm ? 'Hide create form' : 'Create blog post'}
          </button>
          <button
            type="button"
            onClick={() => void fetchPosts()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Refresh list
          </button>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            {posts.length} posts
          </span>
        </div>

        {error ? (
          <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        ) : null}

        {showForm ? (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                  {editingId ? 'Editing post' : 'New post'}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">{heroCopy.title}</h2>
                <p className="text-sm text-slate-500">
                  Keep titles concise and content engaging; you can edit anytime.
                </p>
              </div>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange('title')}
                  required
                  placeholder="Build a MERN blog in 15 minutes"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-sky-500 ring-offset-2 focus:ring-2"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="author">
                    Author
                  </label>
                  <input
                    id="author"
                    name="author"
                    value={form.author}
                    onChange={handleChange('author')}
                    required
                    placeholder="Alex Writer"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-sky-500 ring-offset-2 focus:ring-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="tags">
                    Tags (optional)
                  </label>
                  <input
                    id="tags"
                    placeholder="productivity, tutorials, devnotes"
                    className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm outline-none ring-sky-500 ring-offset-2 focus:ring-2"
                    readOnly
                  />
                  <p className="text-xs text-slate-400">Tag support can be wired later.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange('content')}
                  required
                  rows={8}
                  placeholder="Share your thoughts, ideas, or notes..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-sky-500 ring-offset-2 focus:ring-2"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : heroCopy.cta}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                >
                  Clear
                </button>
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                  Auto refresh enabled
                </span>
              </div>
            </form>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                Blog posts
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {loading ? 'Loading posts...' : 'All posts'}
              </h2>
              <p className="text-sm text-slate-500">
                Your published articles are listed below. Scroll to see them all.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-36 animate-pulse rounded-xl bg-slate-100/80" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
                ✏️
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">No posts yet</p>
                <p className="text-sm text-slate-600">
                  Click “Create blog post” above to add your first entry.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-60" />
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-400">
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                      Live
                    </span>
                    <span className="text-slate-400">{formatDate(post.updatedAt)}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-700">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500">By {post.author}</p>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {post.content.length > 280
                        ? `${post.content.slice(0, 280)}...`
                        : post.content}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError('')
                        setEditingId(post.id)
                        setForm({
                          title: post.title,
                          author: post.author,
                          content: post.content,
                        })
                        setShowForm(true)
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post?._id)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
