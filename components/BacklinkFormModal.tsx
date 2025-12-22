'use client'

import React, { useEffect, useState } from 'react'
import { Backlink, Pitch } from '@/lib/supabase/types'

interface BacklinkFormModalProps {
  pitches: Pitch[]
  backlink: Backlink | null
  onClose: () => void
  onSuccess: () => void
}

export default function BacklinkFormModal({ 
  pitches, 
  backlink, 
  onClose, 
  onSuccess 
}: BacklinkFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pitch_id: backlink?.pitch_id || '',
    source_url: backlink?.source_url || '',
    target_url: backlink?.target_url || '',
    anchor_text: backlink?.anchor_text || '',
    link_type: backlink?.link_type || 'dofollow',
    expires_at: backlink?.expires_at ? backlink.expires_at.split('T')[0] : '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = backlink 
        ? `/api/backlinks/${backlink.id}`
        : '/api/backlinks'
      
      const method = backlink ? 'PUT' : 'POST'

      const payload: any = {
        source_url: formData.source_url,
        target_url: formData.target_url,
        anchor_text: formData.anchor_text || null,
        link_type: formData.link_type,
      }

      if (!backlink) {
        payload.pitch_id = formData.pitch_id
      }

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString()
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to save backlink')
        return
      }

      alert(data.message || 'Backlink saved successfully!')
      onSuccess()
    } catch (err: any) {
      alert('Error saving backlink: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fill target_url when pitch is selected (optional helper)
  useEffect(() => {
    if (formData.pitch_id && !backlink && !formData.target_url) {
      const selectedPitch = pitches.find(p => p.id === formData.pitch_id)
      if (selectedPitch) {
        // Pre-fill with pitch URL as a starting point, but user can change it
        setFormData(prev => ({ ...prev, target_url: selectedPitch.url }))
      }
    }
  }, [formData.pitch_id, pitches, backlink])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {backlink ? 'Edit Backlink' : 'Add New Backlink'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!backlink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pitch *
              </label>
              <select
                value={formData.pitch_id}
                onChange={(e) => setFormData(prev => ({ ...prev, pitch_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a pitch...</option>
                {pitches.map((pitch) => (
                  <option key={pitch.id} value={pitch.id}>
                    {pitch.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source URL (page that has the backlink) *
            </label>
            <input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
              required
              placeholder="https://cnn.com/article or https://bbc.co.uk/page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">The page where your backlink exists (e.g., cnn.com, bbc.co.uk, etc.)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target URL (where the backlink points to) *
            </label>
            <input
              type="url"
              value={formData.target_url}
              onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
              required
              placeholder="https://yoursite.com or https://yoursite.com/page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Your site/page that the backlink points to</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anchor Text (optional)
            </label>
            <input
              type="text"
              value={formData.anchor_text}
              onChange={(e) => setFormData(prev => ({ ...prev, anchor_text: e.target.value }))}
              placeholder="Click here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Type *
            </label>
            <select
              value={formData.link_type}
              onChange={(e) => setFormData(prev => ({ ...prev, link_type: e.target.value as 'dofollow' | 'nofollow' }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="dofollow">Dofollow</option>
              <option value="nofollow">Nofollow</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires At (optional)
            </label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-200 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : backlink ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

