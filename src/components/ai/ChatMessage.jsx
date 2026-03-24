'use client'

import React from 'react'
import { Box, Paper, Typography, Stack, Fade, Tooltip, IconButton, alpha, keyframes, Link } from '@mui/material'
import { ContentCopy as ContentCopyIcon, Edit as EditIcon } from '@mui/icons-material'

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

function ChatMessage({ role, content, theme, isDarkMode, onCopy, onEdit }) {
  const isUser = role === 'user'
  const rawContent = String(content || '')

  const renderInline = text => {
    const parts = text.split(/(`[^`]+`)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <Box
            key={`inline-code-${idx}`}
            component='code'
            sx={{
              px: 0.5,
              py: 0.15,
              borderRadius: 0.75,
              fontSize: '0.82em',
              fontFamily: 'monospace',
              bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.12)
            }}
          >
            {part.slice(1, -1)}
          </Box>
        )
      }

      const chunks = part.split(/(https?:\/\/[^\s]+)/g)
      return chunks.map((chunk, chunkIdx) =>
        /^https?:\/\//.test(chunk) ? (
          <Link
            key={`link-${idx}-${chunkIdx}`}
            href={chunk}
            target='_blank'
            rel='noopener noreferrer'
            underline='hover'
            sx={{ fontSize: 'inherit' }}
          >
            {chunk}
          </Link>
        ) : (
          <React.Fragment key={`txt-${idx}-${chunkIdx}`}>{chunk}</React.Fragment>
        )
      )
    })
  }

  const renderAssistantContent = text => {
    const codeAwareParts = text.split(/(```[\s\S]*?```)/g)

    return codeAwareParts.map((part, partIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const inner = part.replace(/^```[\w-]*\n?/, '').replace(/```$/, '')
        return (
          <Box
            key={`code-block-${partIdx}`}
            component='pre'
            sx={{
              m: 0,
              p: 1.25,
              borderRadius: 1.25,
              overflowX: 'auto',
              border: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
              bgcolor: alpha(theme.palette.common.black, isDarkMode ? 0.28 : 0.06),
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              lineHeight: 1.55
            }}
          >
            {inner}
          </Box>
        )
      }

      const lines = part.split('\n')
      return (
        <Stack key={`text-block-${partIdx}`} spacing={0.5}>
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim()
            if (!trimmed) return <Box key={`sp-${partIdx}-${lineIdx}`} sx={{ height: 4 }} />

            if (/^#{1,6}\s+/.test(trimmed)) {
              const level = Math.min(6, (trimmed.match(/^#+/) || [''])[0].length)
              const textValue = trimmed.replace(/^#{1,6}\s+/, '')
              const variant = level <= 2 ? 'subtitle1' : 'subtitle2'
              return (
                <Typography key={`h-${partIdx}-${lineIdx}`} variant={variant} sx={{ fontWeight: 700, mt: 0.2 }}>
                  {renderInline(textValue)}
                </Typography>
              )
            }

            if (/^(\-|\*|\d+\.)\s+/.test(trimmed)) {
              const bulletText = trimmed.replace(/^(\-|\*|\d+\.)\s+/, '')
              return (
                <Box key={`li-${partIdx}-${lineIdx}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.9 }}>
                  <Box
                    sx={{
                      mt: 0.75,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.text.primary, 0.75),
                      flexShrink: 0
                    }}
                  />
                  <Typography variant='body2' sx={{ lineHeight: 1.65 }}>
                    {renderInline(bulletText)}
                  </Typography>
                </Box>
              )
            }

            return (
              <Typography key={`p-${partIdx}-${lineIdx}`} variant='body2' sx={{ lineHeight: 1.65 }}>
                {renderInline(line)}
              </Typography>
            )
          })}
        </Stack>
      )
    })
  }

  return (
    <Fade in timeout={320}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          width: '100%',
          animation: `${fadeInUp} 0.35s ease-out`
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: '92%', sm: '75%', md: '60%', lg: '55%' },
            '& .message-actions': {
              opacity: 0,
              pointerEvents: 'none',
              transform: 'translateY(-2px)',
              transition: 'opacity 0.18s ease, transform 0.18s ease'
            },
            '&:hover .message-actions': {
              opacity: 1,
              pointerEvents: 'auto',
              transform: 'translateY(0)'
            }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: { xs: 1.75, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.2 : 0.12)}`,
              bgcolor: isUser
                ? alpha(theme.palette.primary.main, isDarkMode ? 0.28 : 0.14)
                : alpha(theme.palette.background.paper, isDarkMode ? 0.9 : 1),
              color: isUser
                ? isDarkMode
                  ? theme.palette.common.white
                  : theme.palette.primary.dark
                : 'text.primary'
            }}
          >
            {isUser ? (
              <Typography
                variant='body2'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {rawContent}
              </Typography>
            ) : (
              <Stack
                spacing={0.75}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  wordBreak: 'break-word'
                }}
              >
                {renderAssistantContent(rawContent)}
              </Stack>
            )}
          </Paper>

          {isUser && (
            <Stack
              className='message-actions'
              direction='row'
              spacing={0.25}
              justifyContent='flex-end'
              sx={{ mt: 0.35 }}
            >
              <Tooltip title='Copy'>
                <IconButton
                  size='small'
                  onClick={onCopy}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      bgcolor: alpha(theme.palette.action.hover, 0.5)
                    }
                  }}
                  aria-label='Copy message'
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Edit'>
                <IconButton
                  size='small'
                  onClick={onEdit}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      bgcolor: alpha(theme.palette.action.hover, 0.5)
                    }
                  }}
                  aria-label='Edit message'
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>
      </Box>
    </Fade>
  )
}

export default ChatMessage
