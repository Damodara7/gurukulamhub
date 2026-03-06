'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

/**
 * Full-screen image viewer for chat message attachments.
 * Receives imageAttachments = [{ url, fileName }], opens in portal for full screen.
 */
const MessageImageViewerModal = ({ open, onClose, imageAttachments = [], initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(typeof document !== 'undefined')
  }, [])

  useEffect(() => {
    if (open) setCurrentIndex(Math.min(initialIndex, Math.max(0, imageAttachments.length - 1)))
  }, [open, initialIndex, imageAttachments.length])

  const goPrev = useCallback(() => {
    if (imageAttachments.length <= 1) return
    setCurrentIndex((i) => (i - 1 + imageAttachments.length) % imageAttachments.length)
  }, [imageAttachments.length])

  const goNext = useCallback(() => {
    if (imageAttachments.length <= 1) return
    setCurrentIndex((i) => (i + 1) % imageAttachments.length)
  }, [imageAttachments.length])

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

  const current = imageAttachments[currentIndex]
  const currentUrl = current?.url || ''
  const total = imageAttachments.length
  const hasMultiple = total > 1

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0,0,0,0.7)',
        animation: 'messageImageViewerFadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <style>{`
        @keyframes messageImageViewerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div
        style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(4px)' }}
        onClick={handleBackdropClick}
      />
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 30,
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
          size="medium"
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
        {hasMultiple && (
          <IconButton
            onClick={goPrev}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
            size="large"
            aria-label="Previous image"
          >
            <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: 16 }}>
          <img
            key={currentIndex}
            src={currentUrl}
            alt={current?.fileName || 'Image'}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 100px)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {hasMultiple && (
          <IconButton
            onClick={goNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
            size="large"
            aria-label="Next image"
          >
            <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </IconButton>
        )}
        {hasMultiple && (
          <div
            style={{
              flexShrink: 0,
              textAlign: 'center',
              padding: '12px 0 24px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 14,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              margin: '0 auto 16px',
              paddingLeft: 12,
              paddingRight: 12
            }}
          >
            {currentIndex + 1} / {total}
          </div>
        )}
      </div>
    </div>
  )

  if (!mounted || typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}

export default MessageImageViewerModal
