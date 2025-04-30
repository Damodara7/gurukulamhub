import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import VideoPortionPlayer from './VideoPortionPlayer'

function VideoPortionPlayerDialog({ data, open, onClose }) {
    return (
        <Dialog fullWidth maxWidth='lg' open={open} onClose={onClose}>
            <DialogTitle
                variant='h4'
                className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
            >
                Look At Your Video As A User
                <Typography component='span' className='flex flex-col text-center'>
                    This is how your video plays in users device.
                </Typography>
            </DialogTitle>

            <DialogContent>
                <VideoPortionPlayer data={data} />
            </DialogContent>

            {/* Actions */}
            <DialogActions className='gap-2 justify-center'>
                <Button onClick={onClose} variant='outlined' color='primary'>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default VideoPortionPlayerDialog