'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Link2, Image as ImageIcon, Tag, Upload, X } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import ReciprocalLinkSection from './ReciprocalLinkSection'

const submissionSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(1000, 'Description must be less than 1000 characters'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag').max(10, 'Maximum 10 tags allowed'),
  category: z.enum(['ai', 'content', 'dev-tools', 'saas', 'design', 'marketing', 'other']),
  thumbnail_url: z.string().url().optional().nullable(),
  favicon_url: z.string().url().optional().nullable(),
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

type SubmissionFormData = z.infer<typeof submissionSchema>

interface OGData {
  title?: string
  description?: string
  image?: string
  favicon?: string
}

export default function SubmissionForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingOG, setIsFetchingOG] = useState(false)
  const [ogData, setOgData] = useState<OGData | null>(null)
  const [pointsReward, setPointsReward] = useState(10)
  const [verifiedReciprocalUrls, setVerifiedReciprocalUrls] = useState<string[]>([])
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push('/auth/login?redirect=/submit')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login?redirect=/submit')
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      tags: [],
      category: 'other',
      launch_status: 'live',
      launch_date: null,
      thumbnail_url: null,
      favicon_url: null,
    },
  })

  const url = watch('url')
  const description = watch('description')

  // Auto-fetch OG data when URL changes
  useEffect(() => {
    if (url && isValidUrl(url)) {
      fetchOGData(url)
    }
  }, [url])

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const fetchOGData = async (url: string) => {
    setIsFetchingOG(true)
    try {
      const response = await fetch('/api/fetch-og-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setOgData(data)
        
        if (data.title) setValue('title', data.title)
        if (data.description) {
          const desc = data.description.length > 1000 
            ? data.description.substring(0, 997) + '...' 
            : data.description
          setValue('description', desc)
        }
        if (data.image) {
          setValue('thumbnail_url', data.image)
          setThumbnailPreview(data.image)
        }
        if (data.favicon) {
          setValue('favicon_url', data.favicon)
          setFaviconPreview(data.favicon)
        }
      }
    } catch (error) {
      console.error('Failed to fetch OG data:', error)
    } finally {
      setIsFetchingOG(false)
    }
  }

  const onSubmit = async (data: SubmissionFormData) => {
    // Check authentication before submitting
    const supabase = createSupabaseClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      alert('You must be logged in to submit a pitch. Redirecting to login...')
      router.push('/auth/login?redirect=/submit')
      return
    }

    // Warn user if no reciprocal links are verified
    if (verifiedReciprocalUrls.length === 0) {
      const proceed = confirm(
        'You haven\'t verified any reciprocal dofollow links. Your pitch will receive a nofollow link instead. Do you want to continue?'
      )
      if (!proceed) {
        return
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          ...data,
          source_url: data.url, // Pass the source URL for reciprocal check
          verified_reciprocal_urls: verifiedReciprocalUrls, // Pass array of verified URLs
          launch_status: data.launch_status,
          launch_date: data.launch_status === 'launching_soon' && data.launch_date ? data.launch_date : null,
          favicon_url: data.favicon_url || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to pitch detail page or show success
        window.location.href = `/pitches/${result.id}`
      } else {
        const errorData = await response.json()
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.')
          router.push('/auth/login?redirect=/submit')
        } else {
          alert(errorData.error || errorData.message || 'Failed to submit pitch')
        }
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleImageUpload = async (file: File, type: 'thumbnail' | 'favicon') => {
    if (type === 'thumbnail') {
      setUploadingThumbnail(true)
    } else {
      setUploadingFavicon(true)
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to upload image')
        return
      }

      const data = await response.json()
      
      if (type === 'thumbnail') {
        setValue('thumbnail_url', data.url)
        setThumbnailPreview(data.url)
      } else {
        setValue('favicon_url', data.url)
        setFaviconPreview(data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      if (type === 'thumbnail') {
        setUploadingThumbnail(false)
      } else {
        setUploadingFavicon(false)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (type === 'favicon') {
      allowedTypes.push('image/x-icon', 'image/vnd.microsoft.icon')
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
      return
    }

    handleImageUpload(file, type)
  }

  const clearImage = (type: 'thumbnail' | 'favicon') => {
    if (type === 'thumbnail') {
      setValue('thumbnail_url', null)
      setThumbnailPreview(null)
    } else {
      setValue('favicon_url', null)
      setFaviconPreview(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2">Pitch Your Page</h1>
        <p className="text-gray-600 mb-6">
          Share your content with the community and get ethical backlinks
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Page URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="url"
                type="url"
                {...register('url')}
                placeholder="https://example.com/my-awesome-page"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {isFetchingOG && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400 w-5 h-5" />
              )}
            </div>
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          {/* Auto-filled Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={6}
              placeholder="Describe your page in at least 100 characters. What makes it special? What problem does it solve?"
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
              <span className="text-sm font-normal text-gray-500 ml-2">(Maximum 10 tags)</span>
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

          {/* Thumbnail Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
              <span className="text-xs text-gray-500 ml-2">(Optional - auto-filled from OG image)</span>
            </label>
            <div className="space-y-2">
              {(watch('thumbnail_url') || thumbnailPreview) && (
                <div className="relative w-full min-h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={thumbnailPreview || watch('thumbnail_url') || ''}
                    alt="Thumbnail preview"
                    className="max-w-full max-h-96 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => clearImage('thumbnail')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {uploadingThumbnail ? 'Uploading...' : (watch('thumbnail_url') || thumbnailPreview ? 'Change Image' : 'Upload Image')}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange(e, 'thumbnail')}
                    className="hidden"
                    disabled={uploadingThumbnail}
                  />
                </label>
                {uploadingThumbnail && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
              </div>
              <p className="text-xs text-gray-500">
                Max file size: 5MB. Required dimensions: 1200x630px (OG image standard). Formats: JPEG, PNG, GIF, or WebP
              </p>
            </div>
          </div>

          {/* Favicon/Logo Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon/Logo Icon
              <span className="text-xs text-gray-500 ml-2">(Optional - auto-filled from site favicon)</span>
            </label>
            <div className="space-y-2">
              {(watch('favicon_url') || faviconPreview) && (
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-gray-300">
                  <img
                    src={faviconPreview || watch('favicon_url') || ''}
                    alt="Favicon preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => clearImage('favicon')}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    title="Remove favicon"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {uploadingFavicon ? 'Uploading...' : (watch('favicon_url') || faviconPreview ? 'Change Favicon' : 'Upload Favicon')}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/x-icon,image/vnd.microsoft.icon"
                    onChange={(e) => handleImageChange(e, 'favicon')}
                    className="hidden"
                    disabled={uploadingFavicon}
                  />
                </label>
                {uploadingFavicon && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
              </div>
              <p className="text-xs text-gray-500">
                Max file size: 5MB. Recommended dimensions: up to 512x512px (JPEG, PNG, GIF, WebP, or ICO)
              </p>
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
              <label htmlFor="launch_date" className="block text-sm font-medium text-gray-700 mb-2">
                Launch Date <span className="text-red-500">*</span>
              </label>
              <input
                id="launch_date"
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
          {url && (
            <ReciprocalLinkSection
              sourceUrl={url}
              onVerificationChange={setVerifiedReciprocalUrls}
            />
          )}

          {/* Points Reward Info */}
          <div className="bg-accent-eggshell border border-primary-300 rounded-lg p-4">
            <p className="text-sm text-primary-400">
              <strong>You'll earn {pointsReward} points</strong> for submitting this pitch!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Pitch'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

