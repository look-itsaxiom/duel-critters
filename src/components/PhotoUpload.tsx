'use client'

import { useState, useRef, useCallback } from 'react'

interface PhotoUploadProps {
  onUpload: (file: File, preview: string) => void
  disabled?: boolean
}

export default function PhotoUpload({ onUpload, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      onUpload(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center
                  transition-colors cursor-pointer
                  ${dragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <img
          src={preview}
          alt="Critter preview"
          className="mx-auto max-h-48 rounded-lg object-contain"
        />
      ) : (
        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          <p className="text-lg font-medium">Drop a photo of your figurine here</p>
          <p className="text-sm text-gray-500">or tap to snap a picture</p>
        </div>
      )}
    </div>
  )
}
