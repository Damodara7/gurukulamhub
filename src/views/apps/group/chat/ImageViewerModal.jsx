'use client'

import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@mui/material'
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material'

const ImageViewerModal = ({ open, onClose, imageFiles = [], initialIndex = 0, onRemoveImage }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [slideDir, setSlideDir] = useState(0)
  const [mounted, setMounted] = useState(false)
  const urlsRef = useRef([])
  const urls = useMemo(() => {
    if (!open || !imageFiles.length) return []
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    urlsRef.current = imageFiles.map((f) => URL.createObjectURL(f))
    return urlsRef.current
  }, [open, imageFiles])

  useEffect(() => {
    setMounted(typeof document !== 'undefined')
  }, [])

  useEffect(() => {
    if (open) setCurrentIndex(Math.min(initialIndex, Math.max(0, imageFiles.length - 1)))
  }, [open, initialIndex, imageFiles.length])

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      urlsRef.current = []
    }
  }, [])

  const goPrev = useCallback(() => {
    if (imageFiles.length <= 1) return
    setSlideDir(-1)
    setCurrentIndex((i) => (i - 1 + imageFiles.length) % imageFiles.length)
  }, [imageFiles.length])

  const goNext = useCallback(() => {
    if (imageFiles.length <= 1) return
    setSlideDir(1)
    setCurrentIndex((i) => (i + 1) % imageFiles.length)
  }, [imageFiles.length])

  const handleRemoveCurrent = useCallback(() => {
    onRemoveImage?.(currentIndex)
    if (imageFiles.length <= 1) {
      onClose?.()
    } else {
      const nextLen = imageFiles.length - 1
      setCurrentIndex((i) => Math.min(i, nextLen - 1))
    }
  }, [currentIndex, imageFiles.length, onRemoveImage, onClose])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, goPrev, goNext])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }

  if (!open) return null

  const currentUrl = urls[currentIndex]
  const total = imageFiles.length
  const hasMultiple = total > 1

  const modalContent = (
    <div
      className="fixed flex flex-col left-0 top-0 right-0 bottom-0"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 1400,
        animation: 'imageViewerFadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <style>{`
        @keyframes imageViewerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes imageViewerSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes imageViewerSlideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes imageViewerFadeOnly {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .image-viewer-img[data-slide-dir="0"] { animation: imageViewerFadeOnly 0.2s ease-out; }
        .image-viewer-img[data-slide-dir="-1"] { animation: imageViewerSlideInLeft 0.25s ease-out; }
        .image-viewer-img[data-slide-dir="1"] { animation: imageViewerSlideIn 0.25s ease-out; }
      `}</style>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ left: 0, top: 0, right: 0, bottom: 0 }}
        onClick={handleBackdropClick}
      />
      <div
        className="relative z-10 flex flex-col flex-1 w-full h-full overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {/* Close button - top right only */}
        <IconButton
          onClick={onClose}
          className="absolute top-3 right-3 z-30 rounded-full bg-white/20 hover:bg-white/30 text-white"
          size="medium"
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
        {hasMultiple && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {/* Image area - takes remaining space, centered */}
        <div className="flex-1 flex items-center justify-center min-h-0 p-4">
          <img
            key={currentIndex}
            src={currentUrl}
            alt=""
            className="image-viewer-img max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
            style={{
              maxHeight: 'calc(100vh - 120px)',
              animationFillMode: 'backwards'
            }}
            data-slide-dir={slideDir}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {hasMultiple && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {/* Bottom bar: count + delete (below image) */}
        <div className="flex-shrink-0 flex items-center justify-center gap-3 py-3 pb-6">
          {hasMultiple && (
            <span className="px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {total}
            </span>
          )}
          {onRemoveImage && (
            <IconButton
              onClick={handleRemoveCurrent}
              className="rounded-full bg-white/20 hover:bg-white/30 text-white"
              size="medium"
              aria-label="Remove from selection"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  )

  if (!mounted || typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}

export default ImageViewerModal
