import React, { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, FormControl, MenuItem, Select, TextField } from '@mui/material'

// Define reward types as objects with name and value
const rewardTypes = [
  { name: 'Physical Gift', value: 'physicalgift' },
  { name: 'Cash', value: 'cash' },
  { name: 'Reward Points', value: 'rewardpoints' },
  { name: 'Voucher', value: 'voucher' },
  { name: 'Other', value: 'other' }
]

const PrizeTable = ({ readonly = false }) => {
  // Initial state for prize table data
  const [rows, setRows] = useState([
    {
      id: 1,
      position: '1st',
      gifts: 3,
      rewardvalue: 500,
      rewardType: 'rewardpoints',
      description: 'Reward Points',
      amount: 500
    },
    {
      id: 2,
      position: '2nd',
      gifts: 2,
      rewardvalue: 500,
      rewardType: 'voucher',
      description: '$200 Gift Voucher',
      amount: 200
    },
    {
      id: 3,
      position: '3rd',
      gifts: 1,
      rewardvalue: 500,
      rewardType: 'physicalgift',
      description: 'Physical Gift: Smartwatch',
      amount: 'Gift'
    },
    { id: 4, position: '4th', gifts: 1, rewardvalue: 500, rewardType: 'cash', description: '250 Rupees', amount: 50 },
    {
      id: 5,
      position: '5th',
      gifts: 2,
      rewardvalue: 500,
      rewardType: 'physicalgift',
      description: 'Physical Gift: Headphones',
      amount: 'Gift'
    }
  ])

  // Process row update, update the state with the modified data
  const processRowUpdate = newRow => {
    const updatedRows = rows.map(row => (row.id === newRow.id ? newRow : row))
    setRows(updatedRows)
    return newRow
  }

  const columns = [
    {
      field: 'position',
      headerName: 'Position',
      width: 140,
      editable: readonly ? false : true // Make the column editable
    },
    {
      field: 'gifts',
      headerName: 'Count',
      width: 130,
      editable: readonly ? false : true // Make the column editable
    },
    {
      field: 'rewardType',
      headerName: 'Reward Type',
      width: 180,
      editable: readonly ? false : true,
      renderCell: params => {
        const { id, rewardType } = params.row
        return (
          <>
            {!readonly ? (
              <FormControl fullWidth>
                {/* <InputLabel>Reward Type</InputLabel> */}
                <Select
                  value={rewardType}
                  onChange={event => {
                    const newRewardType = event.target.value
                    const updatedRows = rows.map(row => (row.id === id ? { ...row, rewardType: newRewardType } : row))
                    setRows(updatedRows)
                  }}
                >
                  {rewardTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField value={rewardType} InputProps={{ readOnly: readonly }} />
            )}
          </>
        )
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      editable: readonly ? false : true // Make the column editable
    },
    {
      field: 'rewardvalue',
      headerName: 'Reward Value ',
      width: 120,
      editable: readonly ? false : true // Make the column editable
    },

    {
      field: 'total',
      headerName: 'Total Amount',
      width: 220,
      valueGetter: params => {
        if (!params || !params.row) return '' // Safeguard against undefined row
        const amount = isNaN(params.row.rewardvalue) ? 1 : params.row.rewardvalue // Default to 1 for non-numeric values
        return params.row.gifts * amount
      }
    }
  ]

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        hideFooterPagination={true}
        hideFooterSelectedRowCount={true}
        // pageSize={5}
        //rowsPerPageOptions={[5]}
        processRowUpdate={processRowUpdate} // Handle updates
        experimentalFeatures={{ newEditingApi: true }} // Enable editing API
      />
    </Box>
  )
}

export default PrizeTable
