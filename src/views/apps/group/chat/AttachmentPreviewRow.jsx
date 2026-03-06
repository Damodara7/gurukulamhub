'use client'

import React, { useEffect, useMemo } from 'react'
import { InsertDriveFile as InsertDriveFileIcon, Delete as DeleteIcon } from '@mui/icons-material'

const THUMB_SIZE = 72 // 60-80px range
const isImageFile = (file) => file?.type?.startsWith('image/')

/**
 * Horizontal scrollable row of attachment previews.
 * Images: square thumbnails with remove button; other files: compact chips.
 */
const AttachmentPreviewRow = ({ selectedFiles = [], onRemoveFile, onPreviewImage }) => {
  const objectUrls = useMemo(() => {
    const urls = []
    selectedFiles.forEach((file) => {
      if (isImageFile(file)) urls.push(URL.createObjectURL(file))
    })
    return urls
  }, [selectedFiles])

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [objectUrls])

  const imageIndices = useMemo(() => {
    const indices = []
    selectedFiles.forEach((file, i) => {
      if (isImageFile(file)) indices.push(i)
    })
    return indices
  }, [selectedFiles])

  if (!selectedFiles.length) return null

  return (
    <div
      className="flex gap-2 mb-2 overflow-x-auto overflow-y-hidden scroll-smooth"
      style={{
        scrollbarWidth: 'thin',
        minHeight: THUMB_SIZE + 8
      }}
    >
      {selectedFiles.map((file, index) => {
        const isImage = isImageFile(file)
        const imageIndexInImages = imageIndices.indexOf(index)
        const objectUrl = isImage ? objectUrls[imageIndexInImages] : null

        if (isImage) {
          return (
            <div
              key={`img-${index}-${file.name}`}
              className="relative flex-shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-800 group"
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            >
              <button
                type="button"
                className="absolute inset-0 w-full h-full block focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset rounded-lg"
                onClick={() => onPreviewImage?.(imageIndexInImages)}
                aria-label="Preview image"
              >
                <img
                  src={objectUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-lg pointer-events-none"
                />
              </button>
              <button
                type="button"
                className="absolute top-0.5 right-0.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFile?.(index)
                }}
                aria-label="Remove"
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          )
        }

        return (
          <div
            key={`file-${index}-${file.name}`}
            className="relative flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 min-w-0 max-w-[140px]"
            style={{ height: THUMB_SIZE }}
          >
            <InsertDriveFileIcon sx={{ fontSize: 20 }} className="text-gray-500 flex-shrink-0" />
            <span className="text-xs truncate flex-1 min-w-0">{file.name}</span>
            <button
              type="button"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
              onClick={() => onRemoveFile?.(index)}
              aria-label="Remove"
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default AttachmentPreviewRow
