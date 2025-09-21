import React from 'react'
import { Grid, Divider, FormControl } from '@mui/material'
import { MuiFileInput } from 'mui-file-input'
import { RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'

const ResumeSection = ({
  formData,
  resumeFileInput,
  handleResumeFileInputChange,
  uploadResumeFileToS3,
  deleteFileFromS3Handler
}) => {
  return (
    <>
      {/* ----Resume---- */}
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider>Upload Resume</Divider>
      </Grid>

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
      </Grid>
    </>
  )
}

export default ResumeSection
