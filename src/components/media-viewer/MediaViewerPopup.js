
import ImageViewer from "./ImageViewer"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useState } from "react"
import VideoPlayer from "./VideoPlayer"

const MediaViewerPopup = ({ imageUrl, mediaType }) => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      {mediaType === 'image' ? (
        <ImageViewer imageUrl={imageUrl} onClick={handleClickOpen} />
      ) : (
        <div onClick={handleClickOpen}>
          <a style={{ display: 'flex', alignItems: 'center' }} href='#'>
            {' '}
            <i className='ri-artboard-fill'></i>Open  {' '}
          </a>
        </div>
      )}
      <Dialog open={open} onClose={handleClose} >
        <DialogTitle>Media Preview</DialogTitle>
        <DialogContent >
          <DialogContentText >
            {mediaType === 'video' ? (
              <VideoPlayer url={imageUrl} width={"50vw"} height={"50vh"} showPause autoPlay={false}></VideoPlayer>
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

export default MediaViewerPopup;
