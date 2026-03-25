'use client'

import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

interface PhotoUploadProps {
  onPhotosChange: (urls: string[]) => void
}

const MAX_FILES = 6
const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      
      // Max dimension 1200px to keep file size reasonable
      const maxDim = 1200
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim
          width = maxDim
        } else {
          width = (width / height) * maxDim
          height = maxDim
        }
      }
      
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('Canvas error')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        blob => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject('Conversion failed')
        },
        'image/webp',
        0.85 // 85% quality — good balance of size and quality
      )
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PhotoUpload({ onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    setError('')
    const fileArray = Array.from(files)

    // Check max photos
    if (photos.length + fileArray.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} photos allowed`)
      return
    }

    // Validate each file
    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG and WebP images are allowed')
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each photo must be under ${MAX_SIZE_MB}MB`)
        return
      }
    }

    setUploading(true)
    const newUrls: string[] = []

    for (const file of fileArray) {
      try {
        // Convert to WebP
        const webpBlob = await convertToWebP(file)
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(fileName, webpBlob, {
            contentType: 'image/webp',
            cacheControl: '3600',
          })

        if (uploadError) {
          setError('Upload failed: ' + uploadError.message)
          setUploading(false)
          return
        }

        // Get public URL
        const { data } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(fileName)

        newUrls.push(data.publicUrl)
      } catch (e) {
        setError('Failed to process image')
        setUploading(false)
        return
      }
    }

    const updatedPhotos = [...photos, ...newUrls]
    setPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    onPhotosChange(updated)
  }

  return (
    <div>
      <label className="text-xs mb-2 block" style={{ color: '#8B8B9E' }}>
        Photos (up to {MAX_FILES} — JPG, PNG, WebP — max {MAX_SIZE_MB}MB each)
      </label>

      {/* Upload area */}
      {photos.length < MAX_FILES && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
          }}
          className="w-full h-32 rounded-lg flex items-center justify-center cursor-pointer transition-all"
          style={{
            backgroundColor: '#0A0A0F',
            border: `2px dashed ${dragOver ? '#F7931A' : '#2A2A3A'}`
          }}
        >
          <div className="text-center">
            {uploading ? (
              <>
                <p className="text-2xl mb-1">⏳</p>
                <p className="text-sm" style={{ color: '#F7931A' }}>Converting and uploading...</p>
              </>
            ) : (
              <>
                <p className="text-2xl mb-1">📷</p>
                <p className="text-sm" style={{ color: '#8B8B9E' }}>
                  Click or drag photos here
                </p>
                <p className="text-xs mt-1" style={{ color: '#2A2A3A' }}>
                  Auto-converted to WebP for fast loading
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files) handleFiles(e.target.files) }}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs mt-2" style={{ color: '#ff4444' }}>{error}</p>
      )}

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="flex gap-3 mt-3 flex-wrap">
          {photos.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
                style={{ border: '1px solid #2A2A3A' }}
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: '#ff4444', color: '#fff' }}
              >
                ×
              </button>
            </div>
          ))}
          <p className="text-xs self-end mb-1" style={{ color: '#8B8B9E' }}>
            {photos.length}/{MAX_FILES} photos
          </p>
        </div>
      )}
    </div>
  )
}