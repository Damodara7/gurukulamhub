import theme from '@/@core/theme'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import ViewQuiz from './ViewQuiz'

const ViewQuizzesPopup = ({ isOpen, onClose, onSelectQuiz, dialogHeader }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '95vh',
          maxHeight: '95vh',
          minWidth: '95vw',
          maxWidth: '95vw',
          overflow: 'auto'
        }
      }}
    >
      <DialogTitle>Quizzes</DialogTitle>
      <DialogContent>
        <div style={{ height: '100%' }}>
          <ViewQuiz theme={theme} onSelectQuiz={onSelectQuiz} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewQuizzesPopup
