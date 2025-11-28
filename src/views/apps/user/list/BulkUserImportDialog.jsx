// React Imports
import { useState, useRef } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Excel parsing
import * as XLSX from 'xlsx'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import { CountryRegionData } from '@/data/regions'

const USER_ROLE = ROLES_LOOKUP.USER

// Validation functions
const validateEmailFormat = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone, countryDialCode) => {
  if (!phone || phone.length <= countryDialCode.length) {
    return false
  }

  const indianRegex = new RegExp('^[6-9][0-9]{9}$')
  if (countryDialCode === '91') {
    const contactWithoutCountryCode = phone.substring(2, phone.length)
    return indianRegex.test(contactWithoutCountryCode)
  }

  return phone.length > countryDialCode.length
}

const BulkUserImportDialog = ({ open, handleClose, refreshUsers }) => {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [validationErrors, setValidationErrors] = useState([])
  const [formatErrors, setFormatErrors] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setFile(null)
    setParsedData([])
    setValidationErrors([])
    setFormatErrors([])
    setIsProcessing(false)
    setProgress(0)
    setResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    handleClose()
  }

  // Handle file selection
  const handleFileChange = async event => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return

    // Reset previous errors
    setFormatErrors([])
    setValidationErrors([])
    setParsedData([])

    // Check file extension
    const fileName = selectedFile.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      const errorMessage = 'Please upload a valid Excel file (.xlsx or .xls)'
      toast.error(errorMessage)
      setFormatErrors([{ message: errorMessage, type: 'File Extension' }])
      return
    }

    setFile(selectedFile)
    await parseExcelFile(selectedFile)
  }

  // Parse Excel file
  const parseExcelFile = async file => {
    try {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length < 2) {
            const errorMessage = 'Excel file must have at least a header row and one data row'
            toast.error(errorMessage)
            setFormatErrors([{ message: errorMessage, type: 'File Structure' }])
            return
          }

          // Get headers (first row)
          const headers = jsonData[0].map(h => (h || '').toString().trim().toLowerCase())
          
          // Expected headers
          const expectedHeaders = ['first name', 'last name', 'email', 'phone', 'country', 'region', 'roles']
          const headerMap = {}
          
          expectedHeaders.forEach(expected => {
            const index = headers.findIndex(h => h === expected || h.includes(expected))
            if (index !== -1) {
              headerMap[expected] = index
            }
          })

          // Validate required headers
          const requiredHeaders = ['first name', 'last name', 'email', 'phone', 'country']
          const missingHeaders = requiredHeaders.filter(h => headerMap[h] === undefined)
          
          if (missingHeaders.length > 0) {
            const errorMessage = `Missing required columns: ${missingHeaders.join(', ')}`
            toast.error(errorMessage)
            setFormatErrors([{ message: errorMessage, type: 'Missing Columns' }])
            return
          }

          // Clear format errors if we got this far
          setFormatErrors([])

          // Parse data rows
          const parsedRows = []
          const errors = []

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            const rowNumber = i + 1

            // Skip empty rows
            if (row.every(cell => !cell || cell.toString().trim() === '')) {
              continue
            }

            const rowData = {
              rowNumber,
              firstname: (row[headerMap['first name']] || '').toString().trim(),
              lastname: (row[headerMap['last name']] || '').toString().trim(),
              email: (row[headerMap['email']] || '').toString().trim().toLowerCase(),
              phone: (row[headerMap['phone']] || '').toString().trim(),
              country: (row[headerMap['country']] || '').toString().trim(),
              region: (row[headerMap['region']] || '').toString().trim(),
              roles: (row[headerMap['roles']] || '').toString().trim()
            }

            // Validate row data
            const rowErrors = validateRow(rowData, rowNumber)
            if (rowErrors.length > 0) {
              errors.push(...rowErrors)
            } else {
              parsedRows.push(rowData)
            }
          }

          setParsedData(parsedRows)
          setValidationErrors(errors)

          if (errors.length > 0) {
            toast.warning(`Found ${errors.length} validation error(s). Please review before importing.`)
          } else {
            toast.success(`Successfully parsed ${parsedRows.length} valid user(s)`)
          }
        } catch (error) {
          console.error('Error parsing Excel file:', error)
          const errorMessage = 'Error parsing Excel file. Please check the file format.'
          toast.error(errorMessage)
          setFormatErrors([{ message: errorMessage, type: 'Parse Error' }])
        }
      }
      reader.onerror = () => {
        const errorMessage = 'Error reading file. Please try again.'
        toast.error(errorMessage)
        setFormatErrors([{ message: errorMessage, type: 'File Read Error' }])
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Error reading file:', error)
      const errorMessage = 'Error reading file. Please check if the file is valid.'
      toast.error(errorMessage)
      setFormatErrors([{ message: errorMessage, type: 'File Read Error' }])
    }
  }

  // Validate a single row
  const validateRow = (rowData, rowNumber) => {
    const errors = []

    if (!rowData.firstname) {
      errors.push({ rowNumber, field: 'First Name', message: 'First name is required' })
    }

    if (!rowData.lastname) {
      errors.push({ rowNumber, field: 'Last Name', message: 'Last name is required' })
    }

    if (!rowData.email) {
      errors.push({ rowNumber, field: 'Email', message: 'Email is required' })
    } else if (!validateEmailFormat(rowData.email)) {
      errors.push({ rowNumber, field: 'Email', message: 'Invalid email format' })
    }

    if (!rowData.phone) {
      errors.push({ rowNumber, field: 'Phone', message: 'Phone number is required' })
    } else {
      // Find country dial code
      const countryObj = CountryRegionData.find(
        data => data[0]?.toLowerCase() === rowData.country?.toLowerCase()
      )
      
      if (!countryObj) {
        errors.push({ rowNumber, field: 'Country', message: 'Invalid country name' })
      } else {
        // Extract dial code from phone (assuming format: +91XXXXXXXXXX or 91XXXXXXXXXX)
        let dialCode = ''
        if (rowData.phone.startsWith('+')) {
          // Try to extract dial code (usually 1-3 digits after +)
          const match = rowData.phone.match(/^\+(\d{1,3})/)
          if (match) {
            dialCode = match[1]
          }
        } else if (rowData.phone.match(/^\d{1,3}/)) {
          // Try first 1-3 digits
          const match = rowData.phone.match(/^(\d{1,3})/)
          if (match) {
            dialCode = match[1]
          }
        }

        // For India, default to 91
        if (countryObj[1] === 'IN' && !dialCode) {
          dialCode = '91'
        }

        if (!validatePhone(rowData.phone, dialCode || '91')) {
          errors.push({
            rowNumber,
            field: 'Phone',
            message: `Invalid phone number format for ${rowData.country}`
          })
        }
      }
    }

    if (!rowData.country) {
      errors.push({ rowNumber, field: 'Country', message: 'Country is required' })
    }

    return errors
  }

  // Process bulk import
  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid users to import')
      return
    }

    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before importing')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResults({ success: [], failed: [] })

    try {
      // Prepare all users data
      const usersPayload = parsedData.map(userData => {
        // Find country object
        const countryObj = CountryRegionData.find(
          data => data[0]?.toLowerCase() === userData.country?.toLowerCase()
        )

        // Process phone number
        let phoneNumber = userData.phone
        let countryDialCode = ''
        
        if (countryObj) {
          // Extract dial code
          if (phoneNumber.startsWith('+')) {
            const match = phoneNumber.match(/^\+(\d{1,3})/)
            if (match) {
              countryDialCode = match[1]
              phoneNumber = phoneNumber.substring(match[0].length)
            }
          } else if (phoneNumber.match(/^\d{1,3}/)) {
            const match = phoneNumber.match(/^(\d{1,3})/)
            if (match) {
              countryDialCode = match[1]
              phoneNumber = phoneNumber.substring(match[1].length)
            }
          }

          // For India, default to 91
          if (countryObj[1] === 'IN' && !countryDialCode) {
            countryDialCode = '91'
            if (!phoneNumber.startsWith('91')) {
              phoneNumber = phoneNumber
            } else {
              phoneNumber = phoneNumber.substring(2)
            }
          }
        }

        // Process roles
        let roles = [USER_ROLE] // Always include USER role
        if (userData.roles) {
          const additionalRoles = userData.roles
            .split(',')
            .map(r => r.trim())
            .filter(r => r && r !== USER_ROLE)
          roles = [...roles, ...additionalRoles]
        }

        return {
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          phone: phoneNumber,
          country: userData.country,
          countryCode: countryObj ? countryObj[1] : '',
          region: userData.region || '',
          roles: roles,
          _rowNumber: userData.rowNumber // Keep row number for error tracking
        }
      })

      // Simulate progress (since it's a single API call)
      setProgress(50)

      // Make single bulk import API call
      const response = await RestApi.post(`${API_URLS.v0.USER_BULK_IMPORT}`, {
        users: usersPayload
      })

      setProgress(100)

      if (response.status === 'success' && response.result) {
        const { success, failed } = response.result

        // Map results with row numbers
        const successResults = success.map(item => ({
          row: usersPayload.find(u => u.email === item.email)?._rowNumber || 'N/A',
          email: item.email
        }))

        const failedResults = failed.map(item => ({
          row: usersPayload.find(u => u.email === item.email)?._rowNumber || 'N/A',
          email: item.email,
          error: item.error
        }))

        setResults({
          success: successResults,
          failed: failedResults
        })

        if (success.length > 0) {
          toast.success(`Successfully imported ${success.length} user(s)`)
          await refreshUsers()
        }

        if (failed.length > 0) {
          toast.warning(`${failed.length} user(s) failed to import. Check details below.`)
        }
      } else {
        toast.error(response.message || 'Bulk import failed')
        setResults({
          success: [],
          failed: parsedData.map(u => ({
            row: u.rowNumber,
            email: u.email,
            error: response.message || 'Unknown error'
          }))
        })
      }
    } catch (error) {
      console.error('Bulk import error:', error)
      toast.error(error.message || 'An unexpected error occurred during bulk import')
      setResults({
        success: [],
        failed: parsedData.map(u => ({
          row: u.rowNumber,
          email: u.email,
          error: error.message || 'Unknown error'
        }))
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Country', 'Region', 'Roles'],
      ['John', 'Doe', 'john.doe@example.com', '+911234567890', 'India', 'Maharashtra', 'ADMIN,SUPER_USER'],
      ['Jane', 'Smith', 'jane.smith@example.com', '+11234567890', 'United States', 'California', 'ADMIN']
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 30 }, // Email
      { wch: 20 }, // Phone
      { wch: 20 }, // Country
      { wch: 20 }, // Region
      { wch: 30 }  // Roles
    ]

    XLSX.writeFile(wb, 'user_import_template.xlsx')
    toast.success('Template downloaded successfully')
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h5'>Bulk Import Users</Typography>
          <IconButtonTooltip title='Close' onClick={handleDialogClose}>
            <i className='ri-close-line' />
          </IconButtonTooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Instructions */}
          <Alert severity='info' sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ mb: 1 }}>
              <strong>Instructions:</strong>
            </Typography>
            <Typography variant='body2' component='div'>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Download the template Excel file below</li>
                <li>Fill in user information (First Name, Last Name, Email, Phone, Country are required)</li>
                <li>Phone format: Include country code (e.g., +911234567890 for India, +11234567890 for US)</li>
                <li>Country: Use full country name (e.g., "India", "United States")</li>
                <li>Region: Optional, use region/state name</li>
                <li>Roles: Optional, comma-separated (e.g., "ADMIN,SUPER_USER"). USER role is added automatically</li>
                <li>Upload the filled Excel file to import users</li>
              </ul>
            </Typography>
          </Alert>

          {/* Download Template Button */}
          <Box display='flex' justifyContent='flex-end'>
            <Button
              variant='outlined'
              startIcon={<i className='ri-download-line' />}
              onClick={downloadTemplate}
              sx={{ mb: 2 }}
            >
              Download Excel Template
            </Button>
          </Box>

          {/* File Upload */}
          <Box display='flex' justifyContent='center'>
            <Box>
                <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls'
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id='excel-file-input'
                />
                <label htmlFor='excel-file-input'>
                <Button variant='contained' size='large' component='span' style={{ color: 'white' }} startIcon={<i className='ri-upload-line' />}>
                    Upload Excel File
                </Button>
                </label>
                {file && (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    Selected: {file.name}
                </Typography>
                )}
            </Box>
          </Box>

          {/* Format Errors */}
          {formatErrors.length > 0 && (
            <Alert severity='error'>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Excel Format Errors ({formatErrors.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formatErrors.map((error, index) => (
                  <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {error.type}:
                    </Typography>
                    <Typography variant='body2' color='error.main'>
                      {error.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Alert>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert severity='error'>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Validation Errors ({validationErrors.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Field</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.rowNumber}</TableCell>
                        <TableCell>{error.field}</TableCell>
                        <TableCell>{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {validationErrors.length > 10 && (
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
                  ... and {validationErrors.length - 10} more errors
                </Typography>
              )}
            </Alert>
          )}

          {/* Parsed Data Summary */}
          {parsedData.length > 0 && (
            <Alert severity={validationErrors.length === 0 ? 'success' : 'warning'}>
              <Typography variant='subtitle2'>
                Ready to import: {parsedData.length} valid user(s)
              </Typography>
            </Alert>
          )}

          {/* Progress */}
          {isProcessing && (
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Importing users... {Math.round(progress)}%
              </Typography>
              <LinearProgress variant='determinate' value={progress} />
            </Box>
          )}

          {/* Results */}
          {results && !isProcessing && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant='h6' sx={{ mb: 2 }}>
                Import Results
              </Typography>
              
              {results.success.length > 0 && (
                <Alert severity='success' sx={{ mb: 2 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    Successfully Imported ({results.success.length})
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {results.success.map((item, index) => (
                      <Chip
                        key={index}
                        label={`Row ${item.row}: ${item.email}`}
                        size='small'
                        color='success'
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Alert>
              )}

              {results.failed.length > 0 && (
                <Alert severity='error'>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    Failed ({results.failed.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                    <Table size='small' stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.failed.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.row}</TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell>{item.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Box mt={3}>
            <Button size='large' onClick={handleDialogClose} disabled={isProcessing}>
            {results ? 'Close' : 'Cancel'}
            </Button>
            <Button
            variant='contained'
            component='label'
            size='large'
            style={{ color: 'white' }}
            onClick={handleImport}
            disabled={isProcessing || parsedData.length === 0 || validationErrors.length > 0 || formatErrors.length > 0}
            startIcon={<i className='ri-upload-cloud-line' />}
            >
            {isProcessing ? 'Importing...' : 'Import Users'}
            </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default BulkUserImportDialog

