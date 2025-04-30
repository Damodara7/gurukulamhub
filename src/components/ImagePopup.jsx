import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import { useState } from 'react'

const ImageComponent = ({ imageUrl, onClick }) => {
  return (
    <div>
      <img
        src={imageUrl}
        style={{ objectFit: 'cover', cursor: 'pointer', maxWidth: '250px', maxHeight: '40px' }}
        alt='Image'
        onClick={onClick}
      />
    </div>
  )
}

const ImagePopup = ({ imageUrl, mediaType }) => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      {mediaType === 'image' ? (
        <ImageComponent imageUrl={imageUrl} onClick={handleClickOpen} />
      ) : (
        <div onClick={handleClickOpen}>
          <a style={{ display: 'flex', alignItems: 'center' }} href='#'>
            {' '}
            <i className='ri-artboard-fill'></i>Open Video popup{' '}
          </a>
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Media Preview</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {mediaType === 'video' ? (
              <VideoAd popup url={imageUrl} width={'50vw'} height={'50vh'} showPause autoPlay={false}></VideoAd>
            ) : (
              <img src={imageUrl} alt='Enlarged Image' style={{ width: '100%' }} />
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ImagePopup
