import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_FAVICON_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']

// Recommended dimensions (OG image standard: 1200x630)
const THUMBNAIL_WIDTH = 1200
const THUMBNAIL_HEIGHT = 630
const FAVICON_MAX_WIDTH = 512
const FAVICON_MAX_HEIGHT = 512

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageType = formData.get('type') as string // 'thumbnail' or 'favicon'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!imageType || !['thumbnail', 'favicon'].includes(imageType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be "thumbnail" or "favicon"' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = imageType === 'favicon' ? ALLOWED_FAVICON_TYPES : ALLOWED_IMAGE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get image dimensions (basic check - we'll use a simple approach)
    // Note: For production, you might want to use a proper image processing library
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Simple dimension check using image metadata
    // For a more robust solution, use sharp or jimp
    let width = 0
    let height = 0
    
    try {
      // Try to parse as PNG
      if (file.type === 'image/png') {
        // PNG signature check and basic header parsing
        // This is simplified - in production use a proper library
        const pngSignature = buffer.slice(0, 8)
        if (pngSignature[0] === 0x89 && pngSignature[1] === 0x50) {
          // Read IHDR chunk for dimensions (offset 16)
          width = buffer.readUInt32BE(16)
          height = buffer.readUInt32BE(20)
        }
      } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        // JPEG parsing is more complex, we'll skip strict validation for now
        // In production, use sharp or jimp
        width = 0 // Will skip dimension check for JPEG
        height = 0
      }
      
      // If we got dimensions, validate them
      if (width > 0 && height > 0) {
        if (imageType === 'thumbnail') {
          // Thumbnail should be exactly 1200x630 (OG image standard)
          if (width !== THUMBNAIL_WIDTH || height !== THUMBNAIL_HEIGHT) {
            return NextResponse.json(
              { error: `Thumbnail must be exactly ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}px (OG image standard). Your image: ${width}x${height}px` },
              { status: 400 }
            )
          }
        } else if (imageType === 'favicon') {
          // Favicon can be up to 512x512
          if (width > FAVICON_MAX_WIDTH || height > FAVICON_MAX_HEIGHT) {
            return NextResponse.json(
              { error: `Favicon dimensions exceed limits. Max dimensions: ${FAVICON_MAX_WIDTH}x${FAVICON_MAX_HEIGHT}px. Your image: ${width}x${height}px` },
              { status: 400 }
            )
          }
        }
      }
    } catch (dimError) {
      // If dimension parsing fails, continue (dimension validation is optional)
      console.warn('Could not parse image dimensions:', dimError)
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${imageType}_${Date.now()}.${fileExt}`
    const filePath = `pitches/${fileName}`

    // Upload to Supabase Storage
    // Note: You'll need to configure a storage bucket called 'pitches'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pitches')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pitches')
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    )
  }
}

