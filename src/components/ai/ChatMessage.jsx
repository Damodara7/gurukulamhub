'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <Typography variant='body2' sx={{ lineHeight: 1.68, mb: 0.8 }}>
                        {children}
                      </Typography>
                    ),
                    h1: ({ children }) => (
                      <Typography variant='h6' sx={{ fontWeight: 700, mt: 0.5, mb: 0.8 }}>
                        {children}
                      </Typography>
                    ),
                    h2: ({ children }) => (
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, mt: 0.5, mb: 0.7 }}>
                        {children}
                      </Typography>
                    ),
                    h3: ({ children }) => (
                      <Typography variant='subtitle2' sx={{ fontWeight: 700, mt: 0.4, mb: 0.6 }}>
                        {children}
                      </Typography>
                    ),
                    ul: ({ children }) => <Box component='ul' sx={{ mt: 0.3, mb: 0.8, pl: 2.2 }}>{children}</Box>,
                    ol: ({ children }) => <Box component='ol' sx={{ mt: 0.3, mb: 0.8, pl: 2.2 }}>{children}</Box>,
                    li: ({ children }) => (
                      <Typography component='li' variant='body2' sx={{ lineHeight: 1.65, mb: 0.35 }}>
                        {children}
                      </Typography>
                    ),
                    code: ({ inline, children }) =>
                      inline ? (
                        <Box
                          component='code'
                          sx={{
                            px: 0.55,
                            py: 0.2,
                            borderRadius: 0.75,
                            fontSize: '0.82em',
                            fontFamily: 'monospace',
                            bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.12)
                          }}
                        >
                          {children}
                        </Box>
                      ) : (
                        <Box
                          component='pre'
                          sx={{
                            m: 0,
                            mb: 0.9,
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
                          <Box component='code'>{children}</Box>
                        </Box>
                      ),
                    a: ({ href, children }) => (
                      <Link href={href} target='_blank' rel='noopener noreferrer' underline='hover'>
                        {children}
                      </Link>
                    ),
                    blockquote: ({ children }) => (
                      <Box
                        sx={{
                          borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                          pl: 1.2,
                          ml: 0.2,
                          my: 0.8,
                          color: 'text.secondary'
                        }}
                      >
                        {children}
                      </Box>
                    ),
                    table: ({ children }) => (
                      <Box sx={{ overflowX: 'auto', mb: 0.9 }}>
                        <Box component='table' sx={{ borderCollapse: 'collapse', minWidth: 420, width: '100%' }}>
                          {children}
                        </Box>
                      </Box>
                    ),
                    th: ({ children }) => (
                      <Box
                        component='th'
                        sx={{
                          textAlign: 'left',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                          py: 0.6,
                          px: 0.7
                        }}
                      >
                        {children}
                      </Box>
                    ),
                    td: ({ children }) => (
                      <Box
                        component='td'
                        sx={{
                          fontSize: '0.78rem',
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
                          py: 0.5,
                          px: 0.7,
                          verticalAlign: 'top'
                        }}
                      >
                        {children}
                      </Box>
                    )
                  }}
                >
                  {rawContent}
                </ReactMarkdown>
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
