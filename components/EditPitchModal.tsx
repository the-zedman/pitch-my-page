'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Tag } from 'lucide-react'
import { Pitch } from '@/lib/supabase/types'
import ReciprocalLinkSection from './ReciprocalLinkSection'

const editPitchSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(1000, 'Description must be less than 1000 characters'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag').max(10, 'Maximum 10 tags allowed'),
  category: z.enum(['ai', 'content', 'dev-tools', 'saas', 'design', 'marketing', 'other']),
  thumbnail_url: z.string().url().optional().nullable(),
  launch_status: z.enum(['live', 'launching_soon']).default('live'),
  launch_date: z.string().optional().nullable(),
}).refine((data) => {
  // If launching_soon, launch_date is required
  if (data.launch_status === 'launching_soon' && !data.launch_date) {
    return false
  }
  return true
}, {
  message: 'Launch date is required when status is "Launching Soon"',
  path: ['launch_date'],
})

type EditPitchFormData = z.infer<typeof editPitchSchema>

interface EditPitchModalProps {
  pitch: Pitch
  onClose: () => void
  onSuccess: () => void
}

export default function EditPitchModal({ pitch, onClose, onSuccess }: EditPitchModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [verifiedReciprocalUrls, setVerifiedReciprocalUrls] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditPitchFormData>({
    resolver: zodResolver(editPitchSchema),
    defaultValues: {
      url: pitch.url,
      title: pitch.title,
      description: pitch.description,
      tags: pitch.tags || [],
      category: pitch.category || 'other',
      thumbnail_url: pitch.thumbnail_url || null,
      launch_status: (pitch as any).launch_status || 'live',
      launch_date: (pitch as any).launch_date ? new Date((pitch as any).launch_date).toISOString().split('T')[0] : null,
    },
  })

  const description = watch('description')
  const url = watch('url')

  const [tagInput, setTagInput] = useState('')
  const tags = watch('tags')

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setValue('tags', [...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data: EditPitchFormData) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/pitches/${pitch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source_url: data.url, // Pass the source URL for reciprocal check
          verified_reciprocal_urls: verifiedReciprocalUrls, // Pass array of verified URLs
          re_verify_reciprocal: verifiedReciprocalUrls.length > 0, // Flag to re-verify
          launch_status: data.launch_status,
          launch_date: data.launch_status === 'launching_soon' && data.launch_date ? data.launch_date : null,
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || error.message || 'Failed to update pitch')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Pitch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* URL Input */}
          <div>
            <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 mb-2">
              Page URL <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-url"
              type="url"
              {...register('url')}
              placeholder="https://example.com/my-awesome-page"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              {...register('title')}
              placeholder="Enter a compelling title for your pitch"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              {watch('title')?.length || 0} / 200 characters
            </p>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              {...register('description')}
              rows={6}
              placeholder="Describe your page in at least 100 characters..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-500">
                {description?.length || 0} / 1000 characters (minimum 100)
              </p>
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <Tag className="w-5 h-5 text-gray-400 mt-2" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add tags (press Enter)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-accent-eggshell text-primary-400 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['ai', 'content', 'dev-tools', 'saas', 'design', 'marketing', 'other'] as const).map((cat) => (
                <label key={cat} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value={cat}
                    {...register('category')}
                    className="text-primary-500"
                  />
                  <span className="text-sm capitalize">{cat.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Launch Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="live"
                  {...register('launch_status')}
                  className="text-primary-500"
                />
                <span className="text-sm">Live</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="launching_soon"
                  {...register('launch_status')}
                  className="text-primary-500"
                />
                <span className="text-sm">Launching Soon</span>
              </label>
            </div>
          </div>

          {/* Launch Date (if launching soon) */}
          {watch('launch_status') === 'launching_soon' && (
            <div>
              <label htmlFor="edit-launch_date" className="block text-sm font-medium text-gray-700 mb-2">
                Launch Date <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-launch_date"
                type="date"
                {...register('launch_date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.launch_date && (
                <p className="mt-1 text-sm text-red-600">{errors.launch_date.message}</p>
              )}
            </div>
          )}

          {/* Reciprocal Backlinks Section */}
          <div>
            <ReciprocalLinkSection
              sourceUrl={url}
              onVerificationChange={setVerifiedReciprocalUrls}
            />
          </div>

          {/* Submit Buttons */}
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-200 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Pitch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



