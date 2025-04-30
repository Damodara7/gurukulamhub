
const ImageViewer = ({ imageUrl, onClick }) => {
  return (
    <div>
      <img
        src={imageUrl}
        style={{ objectFit: 'cover', cursor: 'pointer', maxWidth: '200px', maxHeight: '200px' }}
        alt='Image'
        onClick={onClick}
      />
    </div>
  )
}

export default ImageViewer
