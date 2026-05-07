import React from 'react'
import { Grid, Divider, FormControl, Box, Typography, Link, Stack, IconButton } from '@mui/material'
import { MuiFileInput } from 'mui-file-input'
import { RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'
import DeleteIcon from '@mui/icons-material/Delete'

const ResumeSection = ({
  formData,
  resumeFileInput,
  existingResumeFile,
  profileFileViewUrlBuilder,
  onDeleteResumeFile,
  handleResumeFileInputChange,
  uploadResumeFileToS3,
  deleteFileFromS3Handler
}) => {
  return (
    <>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <MuiFileInput
            label='Resume'
            name='resumeFileInput'
            value={resumeFileInput}
            onChange={handleResumeFileInputChange}
            fullWidth
            clearIconButtonProps={{
              title: 'Remove',
              children: <RiCloseFill />
            }}
            placeholder='upload your resume (.pdf/.doc/.docx)'
            InputProps={{
              inputProps: {
                accept: '.pdf,.doc,.docx'
              },
              startAdornment: <IoMdAttach />
            }}
          />
        </FormControl>
        {!resumeFileInput && existingResumeFile?.url && (
          <Box sx={{ mt: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Existing file: {existingResumeFile.fileName || 'Resume'}
            </Typography>
            <Stack direction='row' spacing={1.5} sx={{ mt: 0.5 }}>
              <Link
                href={profileFileViewUrlBuilder?.('resume') || existingResumeFile.url}
                target='_blank'
                rel='noopener noreferrer'
                underline='hover'
              >
                View
              </Link>
              <Link
                href={profileFileViewUrlBuilder?.('resume') || existingResumeFile.url}
                target='_blank'
                rel='noopener noreferrer'
                underline='hover'
                download={existingResumeFile.fileName || 'resume'}
              >
                Download
              </Link>
              <IconButton
                size='small'
                color='error'
                onClick={onDeleteResumeFile}
                sx={{ p: 0.25 }}
                title='Delete resume'
              >
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Grid>
    </>
  )
}

export default ResumeSection
