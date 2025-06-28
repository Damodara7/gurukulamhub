import { useState } from 'react'
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Button,
  FormControl,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip
} from '@mui/material'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import AddIcon from '@mui/icons-material/Add'
import { RiCloseFill } from 'react-icons/ri'
import { IoMdAttach, IoMdClose } from 'react-icons/io'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import useUUID from '@/app/hooks/useUUID'
import { MuiFileInput } from 'mui-file-input'

const QuizDocuments = ({ documents = [], setTheFormValue }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [currentDocument, setCurrentDocument] = useState({
    id: null,
    description: '',
    document: null
  })
  const { getUUID } = useUUID()

  const hasDocuments = documents.some(doc => doc.document);

  // Handle opening the add document dialog
  const handleOpenAddDialog = () => {
    setCurrentDocument({
      id: getUUID(),
      description: '',
      document: null
    })
    setOpenDialog(true)
  }

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  // Handle saving the document
  const handleSaveDocument = () => {
    setTheFormValue('documents', [...documents, currentDocument])
    setOpenDialog(false)
  }

  // Handle input changes in dialog
  const handleDialogInputChange = e => {
    const { name, value } = e.target
    setCurrentDocument(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file input changes in dialog
  const handleDialogFileChange = file => {
    setCurrentDocument(prev => ({
      ...prev,
      document: file
    }))
  }

  // Remove uploaded file from a document
  const handleRemoveFile = id => {
    const updatedDocuments = documents.map(doc => (doc.id === id ? { ...doc, document: null } : doc))
    setTheFormValue('documents', updatedDocuments)
  }

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '100%',
        height: '100%',
        p: 2
      }}
    >
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h6'>Related Documents</Typography>

        <IconButtonTooltip
          title='Add Document'
          color='primary'
          onClick={handleOpenAddDialog}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <AddIcon />
          <Typography color='primary'>Add Document</Typography>
        </IconButtonTooltip>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          maxHeight: '70px', // Height for 2 rows (adjust as needed)
          overflowY: 'auto'
        }}
      >
        {hasDocuments ? (
          documents.map(
            document =>
              document.document && (
                <Tooltip key={document.id} title={document.document.name} arrow>
                  <Chip
                    key={document.id}
                    icon={<InsertDriveFileOutlinedIcon color='info' fontSize='small' />}
                    label={
                      <Box component='span' sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component='span'
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px', // Reduced to accommodate extension
                            display: 'inline-block'
                          }}
                        >
                          {document.document.name.substring(0, document.document.name.lastIndexOf('.'))}
                        </Box>
                        <Box component='span'>
                          {document.document.name.substring(document.document.name.lastIndexOf('.'))}
                        </Box>
                      </Box>
                    }
                    onDelete={() => handleRemoveFile(document.id)}
                    deleteIcon={<IoMdClose />}
                    variant='outlined'
                    sx={{
                      '.MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        maxWidth: '150px' // Adjust width as needed
                      },
                      flexShrink: 0 //prevent chips from shrinking
                    }}
                  />
                </Tooltip>
              )
          )
        ) : (
          <Box
            sx={{
              width: '100%', // Take full width
              textAlign: 'center' // Center text within the Box
            }}
          >
            <Typography variant='body2' fontSize='1rem' color='textSecondary'>
              No documents added
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add Document Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label='Document Description'
              name='description'
              value={currentDocument.description}
              onChange={handleDialogInputChange}
              variant='outlined'
              fullWidth
              required
              sx={{ mb: 3 }}
            />

            <MuiFileInput
              label='Upload Document'
              value={currentDocument.document}
              onChange={handleDialogFileChange}
              fullWidth
              clearIconButtonProps={{
                title: 'Remove',
                children: <RiCloseFill />
              }}
              placeholder='Upload document (pdf/doc/image)'
              InputProps={{
                inputProps: {
                  accept: '.pdf,.doc,.docx,.jpeg,.png,.jpg'
                },
                startAdornment: <IoMdAttach />
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveDocument}
            variant='contained'
            disabled={!currentDocument.description || !currentDocument.document}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizDocuments
