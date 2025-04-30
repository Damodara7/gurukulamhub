import { Box, Typography, Grid, Chip, Fab, Button, useTheme, Alert, IconButton } from '@mui/material'
import { ArrowForward, ChevronRight as ChevronRightIcon } from '@mui/icons-material'
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import Link from 'next/link'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'

function QuizPosterScreen({ quizData, onClickStart, language = null, quizLanguages = [] }) {
  const theme = useTheme()
  const { thumbnail, title, details, owner, syllabus, contextIds, courseLinks, documents, tags } = quizData

  // Show alert if language is not provided
  // if (!language) {
  //   return (
  //     <Box 
  //       sx={{
  //         width: '100%',
  //         p: { xs: 0, md: 4 },
  //         position: 'relative',
  //         maxWidth: '1200px',
  //         margin: 'auto',
  //         borderRadius: '12px'
  //       }}
  //       className='flex flex-col items-center'
  //     >
  //       <Alert icon={false} severity='error'>
  //         Quiz does not exist in this language. Please check the available languages below.
  //       </Alert>

  //       <ChevronToggleComponent
  //         heading={'Available Languages:'}
  //         minimizedSubHeading={'Click to view available languages'}
  //       >
  //         <Box className='flex flex-col gap-4' sx={{ width: '100%' }}>
  //           {quizLanguages.map(lang => (
  //             <Link
  //               key={lang.code}
  //               href={`/publicquiz/play/${quizData?._id}?languageCode=${lang.code}`}
  //               replace
  //               sx={{
  //                 display: 'flex',
  //                 alignItems: 'center',
  //                 p: 2,
  //                 borderRadius: '8px',
  //                 transition: 'all 0.3s ease-in-out',
  //                 backgroundColor: 'action.hover',
  //                 '&:hover': {
  //                   backgroundColor: 'primary.light',
  //                   textDecoration: 'none',
  //                   transform: 'scale(1.02)'
  //                 },
  //                 boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  //               }}
  //             >
  //               <Typography
  //                 variant='body1'
  //                 color='primary'
  //                 sx={{
  //                   fontWeight: 'bold',
  //                   display: 'flex',
  //                   alignItems: 'center',
  //                   gap: 1,
  //                   fontSize: '1rem',
  //                   transition: 'color 0.3s ease-in-out, transform 0.3s ease-in-out',
  //                   '&:hover': { color: 'primary.dark' } // Change text color on hover
  //                 }}
  //               >
  //                 {lang.name}
  //                 <IconButtonTooltip title=''
  //                   size='small'
  //                   edge='end'
  //                   sx={{
  //                     transition: 'transform 0.3s ease-in-out',
  //                     '&:hover': { transform: 'translateX(4px)' } // Move icon on hover
  //                   }}
  //                 >
  //                   <ChevronRightIcon color='primary' />
  //                 </IconButtonTooltip>
  //               </Typography>
  //             </Link>
  //           ))}
  //         </Box>
  //       </ChevronToggleComponent>
  //     </Box>
  //   )
  // }

  return (
    <Box
      sx={{ width: '100%', position: 'relative', pb: 8,
      maxWidth: '1200px', margin: 'auto' }}
      className='flex flex-col items-center'
    >
      {/* Thumbnail Section */}
      <Box sx={{ width: '100%', textAlign: 'center', mb: 0 }}>
        <img
          src={thumbnail || 'https://fakeimg.pl/250x250/?text='+title}
          alt={title}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '300px',
            borderRadius: '12px',
            border: `2px solid ${theme.palette.primary.main}`,
            maxWidth: '400px', // Constrain width on larger devices
            margin: 'auto' // Center align
          }}
        />
      </Box>

      {/* Title and Details Section */}
      <Grid container spacing={3} sx={{ mb: 2, textAlign: 'center' }}>
        <Grid item xs={12}>
          <Typography
            variant='body1'
            color='textSecondary'
            sx={{
              fontSize: { xs: '0.9rem' },
              maxWidth: '800px',
              margin: 'auto'
            }}
          >
            {details}
          </Typography>
        </Grid>
      </Grid>

      {/* Additional Information Section */}
      <Box className='flex flex-col items-center'>
        <Grid container spacing={3} sx={{ mb: 4 }} className='flex flex-col items-start'>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>
              <strong>Language:</strong> {language?.name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>
              <strong>Owner:</strong> {owner}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>
              <strong>Syllabus:</strong> {syllabus}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>
              <strong>Context IDs:</strong> {contextIds}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {/* <Typography variant='subtitle1'>
              <strong>Course Links:</strong>
            </Typography> */}
            <ChevronToggleComponent
              heading={'Course Links:'}
              minimizedSubHeading={'Click the chevron to view course links'}
            >
              {courseLinks?.length > 0 ? (
                <Box className='flex flex-col gap-4'>
                  {courseLinks.map((link, index) => (
                    <Box key={index} className='flex flex-col gap-1 items-start'>
                      <Box className='flex flex-col gap-1 items-center'>
                        <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                        <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color='error'>No course links exist.</Typography>
              )}
            </ChevronToggleComponent>
          </Grid>
          <Grid item xs={12}>
            {/* <Typography variant='subtitle1'>
              <strong>Documents:</strong>
            </Typography> */}
            <ChevronToggleComponent heading={'Documents:'} minimizedSubHeading={'Click the chevron to view documents'}>
              {documents?.length > 0 ? (
                documents.map((document, index) => (
                  <Box key={index} display='flex' alignItems='center' gap={2} mb={1}>
                    <Typography variant='body2'>{`Document ${index + 1}: ${document.description}`}</Typography>
                    <Link href={document?.document || ''} target='_blank' rel='noopener noreferrer'>
                      <Typography color='primary'>View Document</Typography>
                    </Link>
                  </Box>
                ))
              ) : (
                <Typography color='error'>No documents exist.</Typography>
              )}
            </ChevronToggleComponent>
          </Grid>
          {/* <Grid item xs={12}>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              <strong>Tags:</strong>
            </Typography>
            <Box display='flex' gap={1} flexWrap='wrap'>
              {tags.map((tag, index) => (
                <Chip key={index} label={tag} color='secondary' sx={{ fontSize: '0.9rem' }} />
              ))}
            </Box>
          </Grid> */}
        </Grid>
      </Box>

      {/* Floating Next Button */}
      {/* <Button
        color='primary'
        aria-label='next'
        component='label'
        variant='contained'
        onClick={onClickStart}
        sx={{
          position: 'fixed',
          color: 'white',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark
          }
        }}
      >
        Next
      </Button> */}
    </Box>
  )
}

export default QuizPosterScreen
