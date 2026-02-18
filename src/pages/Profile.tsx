import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile } from '../services/profileService'
import { validateRequired } from '../utils/validation'

export function Profile() {
  const { profile, session } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) setName(profile.name)
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id) return
    const err = validateRequired(name, 'Name')
    if (err) {
      setError(err)
      return
    }
    setError('')
    setSaving(true)
    setMessage('')
    try {
      await updateProfile(profile.id, { name })
      setMessage('Profile updated successfully.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-slide-up">
      <p className="text-gold-dark font-medium tracking-[0.15em] uppercase text-xs mb-2">
        Account
      </p>
      <h1 className="text-4xl font-display font-medium text-ink mb-10">
        Profile
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-sm bg-red-50/80 text-red-700 border border-red-100 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="p-4 rounded-sm bg-green-50/80 text-green-800 border border-green-100 text-sm">
            {message}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Email
          </label>
          <input
            type="email"
            value={session?.user?.email ?? ''}
            disabled
            className="w-full px-4 py-3 border border-sand bg-sand/30 rounded-sm text-charcoal/70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-sand bg-white rounded-sm focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-ink text-cream rounded-sm hover:bg-charcoal transition-all disabled:opacity-60 font-medium tracking-wide shadow-soft"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
