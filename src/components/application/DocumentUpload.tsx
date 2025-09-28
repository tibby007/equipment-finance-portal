'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt: Date
  category: 'invoice' | 'quote' | 'financial' | 'other'
}

interface DocumentUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  onValidationChange?: (isValid: boolean) => void
}

export function DocumentUpload({
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10,
  onValidationChange
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { authUser } = useAuth()

  // Check if equipment invoice is uploaded
  useEffect(() => {
    const hasEquipmentInvoice = files.some(file => file.category === 'invoice')
    onValidationChange?.(hasEquipmentInvoice)
  }, [files, onValidationChange])

  // Allowed file types
  const allowedTypes = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/csv': '.csv'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(allowedTypes).includes(file.type)) {
      return `File type not allowed. Allowed types: ${Object.values(allowedTypes).join(', ')}`
    }

    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size too large. Maximum size: ${maxFileSize}MB`
    }

    // Check total files
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`
    }

    return null
  }

  const uploadFileToSupabase = async (file: File, category: string): Promise<UploadedFile | null> => {
    try {
      if (!authUser) throw new Error('User not authenticated')

      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `applications/${authUser.id}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path)

      return {
        id: `${timestamp}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        uploadedAt: new Date(),
        category: category as 'invoice' | 'quote' | 'financial' | 'other'
      }

    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleFileUpload = useCallback(async (fileList: FileList, category: string = 'other') => {
    setUploading(true)

    const uploadPromises = Array.from(fileList).map(async (file) => {
      const validationError = validateFile(file)
      if (validationError) {
        alert(`${file.name}: ${validationError}`)
        return null
      }

      return await uploadFileToSupabase(file, category)
    })

    try {
      const uploadResults = await Promise.all(uploadPromises)
      const successfulUploads = uploadResults.filter(result => result !== null) as UploadedFile[]

      const updatedFiles = [...files, ...successfulUploads]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)

      if (successfulUploads.length > 0) {
        alert(`Successfully uploaded ${successfulUploads.length} file(s)`)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [files, onFilesChange, validateFile, uploadFileToSupabase])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const removeFile = async (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'invoice': return 'bg-blue-100 text-blue-800'
      case 'quote': return 'bg-green-100 text-green-800'
      case 'financial': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderUploadSection = (title: string, description: string, category: string) => (
    <Card className="border-dashed border-2 hover:border-green-400 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center
            ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300'}
            hover:border-green-400 hover:bg-gray-50 transition-colors cursor-pointer
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.accept = Object.keys(allowedTypes).join(',')
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement
              if (target.files) {
                handleFileUpload(target.files, category)
              }
            }
            input.click()
          }}
        >
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-green-600">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              PDF, JPG, PNG, DOC, XLS up to {maxFileSize}MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderUploadSection(
          "Equipment Invoice/Quote *",
          "Required: Upload the equipment invoice or quote from your vendor",
          "invoice"
        )}
        {renderUploadSection(
          "Financial Documents (Optional)",
          "Upload bank statements, tax returns, or financial statements",
          "financial"
        )}
      </div>

      {renderUploadSection(
        "Additional Documents (Optional)",
        "Upload any other supporting documents for your application",
        "other"
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📎</span>
              Uploaded Documents ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.type.includes('pdf') && <span className="text-red-500">📄</span>}
                      {file.type.includes('image') && <span className="text-blue-500">🖼️</span>}
                      {(file.type.includes('doc') || file.type.includes('word')) && <span className="text-blue-600">📝</span>}
                      {(file.type.includes('excel') || file.type.includes('csv')) && <span className="text-green-600">📊</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Badge className={getCategoryColor(file.category)}>
                      {file.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="text-xs"
                      >
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span className="text-sm text-gray-600">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  )
}