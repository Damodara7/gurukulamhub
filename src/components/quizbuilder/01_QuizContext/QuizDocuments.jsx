import { useState } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  useTheme
} from '@mui/material'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import { RiCloseFill } from 'react-icons/ri'
import { IoMdAttach, IoMdClose } from 'react-icons/io'
import { toast } from 'react-toastify'
import { MuiFileInput } from 'mui-file-input'

import IconButtonTooltip from '@/components/IconButtonTooltip'
import useUUID from '@/app/hooks/useUUID'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

function formatSize(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const QuizDocuments = ({ documents = [], setTheFormValue, loading }) => {
  const theme = useTheme()
  const { getUUID } = useUUID()

  const [openDialog, setOpenDialog] = useState(false)
  const [currentDocument, setCurrentDocument] = useState({
    id: null,
    description: '',
    file: null
  })

  const docList = Array.isArray(documents) ? documents : []
  const visibleDocs = docList.filter(doc => doc?.url || doc?.document || doc?.file)
  const hasDocuments = visibleDocs.length > 0

  const handleOpenAddDialog = () => {
    setCurrentDocument({ id: getUUID(), description: '', file: null })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentDocument({ id: null, description: '', file: null })
  }

  const handleDescriptionChange = e => {
    setCurrentDocument(prev => ({ ...prev, description: e.target.value }))
  }

  const handleFileChange = file => {
    if (!file) {
      setCurrentDocument(prev => ({ ...prev, file: null }))
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File too large. Max ${Math.floor(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB.`)
      return
    }
    setCurrentDocument(prev => ({ ...prev, file }))
  }

  const handleStageDocument = () => {
    if (!currentDocument.description?.trim() || !currentDocument.file) return

    const staged = {
      id: currentDocument.id,
      description: currentDocument.description.trim(),
      file: currentDocument.file,
      fileName: currentDocument.file.name,
      mimeType: currentDocument.file.type || 'application/octet-stream',
      size: currentDocument.file.size,
      pending: true
    }

    setTheFormValue('documents', [...docList, staged])
    setOpenDialog(false)
    setCurrentDocument({ id: null, description: '', file: null })
  }

  const handleRemoveDocument = docId => {
    setTheFormValue(
      'documents',
      docList.filter(d => d.id !== docId)
    )
  }

  return (
    <Box sx={{ width: '100%', height: '100%', opacity: loading ? 0.7 : 1 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h6'>Related Documents</Typography>

        <IconButtonTooltip
          title='Add Document'
          color='primary'
          onClick={!loading ? handleOpenAddDialog : undefined}
          disabled={loading}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: '4px',
            '&:hover': { backgroundColor: !loading ? 'action.hover' : undefined }
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
          maxHeight: '70px',
          overflowY: 'auto'
        }}
      >
        {hasDocuments ? (
          visibleDocs.map(doc => {
            const url = doc.url || doc.document
            const isPending = !!doc.file && !url
            const displayName = doc.fileName || doc.description || 'Document'
            const sizeLabel = formatSize(doc.size)
            const tooltip = isPending
              ? `${doc.description || displayName} — will upload when you click Create Quiz`
              : `${doc.description || displayName} — ${displayName}`
            return (
              <Tooltip key={doc.id} title={tooltip} arrow>
                <Chip
                  icon={
                    isPending ? (
                      <CloudOffIcon color='warning' fontSize='small' />
                    ) : (
                      <InsertDriveFileOutlinedIcon color='info' fontSize='small' />
                    )
                  }
                  label={
                    <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        component='span'
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '160px',
                          display: 'inline-block'
                        }}
                      >
                        {displayName}
                        {sizeLabel ? ` (${sizeLabel})` : ''}
                      </Box>
                      {url && !isPending && (
                        <IconButton
                          component='a'
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          size='small'
                          onClick={e => e.stopPropagation()}
                          sx={{ p: 0.25 }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  }
                  onDelete={() => handleRemoveDocument(doc.id)}
                  deleteIcon={<IoMdClose />}
                  variant='outlined'
                  color={isPending ? 'warning' : 'default'}
                  sx={{
                    '.MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                      maxWidth: '240px'
                    },
                    flexShrink: 0
                  }}
                />
              </Tooltip>
            )
          })
        ) : (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant='body2' fontSize='1rem' color='textSecondary'>
              No documents added
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: { xs: 1, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600
          }}
        >
          Add New Document
          <IconButton
            onClick={handleCloseDialog}
            size='small'
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover', color: 'text.primary' }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label='Document Description'
              name='description'
              value={currentDocument.description}
              onChange={handleDescriptionChange}
              variant='outlined'
              fullWidth
              required
              sx={{ mb: 3 }}
            />

            <MuiFileInput
              label='Upload Document'
              value={currentDocument.file}
              onChange={handleFileChange}
              fullWidth
              clearIconButtonProps={{
                title: 'Remove',
                children: <RiCloseFill />
              }}
              placeholder='Upload document (pdf/doc/xls/ppt/txt/image)'
              InputProps={{
                inputProps: {
                  accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif'
                },
                startAdornment: <IoMdAttach />
              }}
            />

            <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
              Max size {Math.floor(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB. The file is uploaded to secure storage only
              when you click <strong>Create Quiz</strong> / <strong>Update Quiz</strong>.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={handleCloseDialog}
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStageDocument}
            variant='contained'
            component='label'
            sx={{ color: 'white' }}
            disabled={!currentDocument.description?.trim() || !currentDocument.file || loading}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizDocuments
