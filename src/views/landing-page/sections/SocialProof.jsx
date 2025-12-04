'use client'
import React from 'react'
import { Box, Container, Typography, Grid, Paper, Stack, Avatar, Rating, useTheme } from '@mui/material'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Engineering Student',
    avatar: '/images/avatars/1.png',
    rating: 5,
    text: 'GurukulamHub made studying for my exams so much more fun! I won ₹5000 in a competition last week. Highly recommended!'
  },
  {
    name: 'Priya Patel',
    role: 'Medical Student',
    avatar: '/images/avatars/3.png',
    rating: 5,
    text: 'The quizzes are challenging and the competitive element keeps me engaged. Best learning platform I\'ve used!'
  },
  {
    name: 'Amit Kumar',
    role: 'Teacher',
    avatar: '/images/avatars/2.png',
    rating: 5,
    text: 'My students love competing on this platform. It\'s transformed how they engage with learning material.'
  }
]

function SocialProof() {
  const theme = useTheme()

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Header */}
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' }
              }}
            >
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
              Join thousands of happy learners and educators
            </Typography>
          </Stack>

          {/* Testimonials */}
          <Box>
            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent='center'>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-8px)',
                        boxShadow: `0 15px 40px ${theme.palette.primary.main}20`
                      }
                    }}
                  >
                    <Stack spacing={3}>
                      {/* Quote Icon */}
                      <Box
                        sx={{
                          width: { xs: 40, md: 50 },
                          height: { xs: 40, md: 50 },
                          borderRadius: 2,
                          bgcolor: `${theme.palette.primary.main}15`,
                          color: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FormatQuoteIcon sx={{ fontSize: { xs: 24, md: 30 } }} />
                      </Box>

                      {/* Rating */}
                      <Rating 
                        value={testimonial.rating} 
                        readOnly 
                        size="small"
                        sx={{
                          '& .MuiRating-icon': {
                            fontSize: { xs: '1.25rem', md: '1.5rem' }
                          }
                        }}
                      />

                      {/* Text */}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.8, 
                          color: 'text.secondary',
                          fontSize: { xs: '0.875rem', md: '1rem' }
                        }}
                      >
                        "{testimonial.text}"
                      </Typography>

                      {/* Author */}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          sx={{ width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 } }}
                        />
                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={700}
                            sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                          >
                            {testimonial.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                          >
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Stats Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white'
            }}
          >
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={4}>
                <Stack alignItems="center" spacing={1}>
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
                  >
                    4.8/5
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  >
                    Average Rating
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack alignItems="center" spacing={1}>
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
                  >
                    50K+
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  >
                    Games Played
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack alignItems="center" spacing={1}>
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
                  >
                    ₹50L+
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  >
                    Prizes Distributed
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}

export default SocialProof

