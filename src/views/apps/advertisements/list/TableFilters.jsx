// React Imports
import { useState, useEffect,forwardRef } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import StartAndEndDatePicker from './StartAndEndDatePicker'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { TextField } from '@mui/material'

// Third-party Imports
import { format, addDays } from 'date-fns'


const TableFilters = ({ setData, tableData }) => {
  // States
  const [role, setRole] = useState('')
  const [plan, setPlan] = useState('')
  const [status, setStatus] = useState('')
  const [dateTodayBtn, setDateTodayBtn] = useState(new Date())


  useEffect(() => {
    if(tableData && tableData.length > 0){

     const filteredData = tableData?.filter(user => {
      if (role && user.role !== role) return false
      if (plan && user.currentPlan !== plan) return false
      if (status && user.status !== status) return false

      return true
    })

    setData(filteredData)
  }
  }, [setData])


  const CustomInput = forwardRef((props, ref) => {
    const { label, start} = props

    const startDate = format(start, 'MM/dd/yyyy')
    //const endDate = end !== null ? ` - ${format(end, 'MM/dd/yyyy')}` : null

    const value = `${startDate}`

    return <TextField fullWidth inputRef={ref} label={label} value={value} />
  })



  const PickersComponent = forwardRef(({ ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        className='is-full'
        error={props.error}
      />
    )
  })

  return (
    <CardContent>
      <Grid container spacing={5}>

      <Grid item xs={12} sm={4}>
      <AppReactDatepicker
          todayButton='Today'
          selected={dateTodayBtn}
          id='picker-date-today-btn'
          onChange={(date) => setDateTodayBtn(date)}
          customInput={<PickersComponent label='Start Date' registername='startDate' />}
          //customInput={<CustomInput2 label={"Start Date "} start={dateTodayBtn}/>}
        />      <Grid item xs={12} lg={4}>

      </Grid>
      </Grid>


        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Select Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Select Status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>InActive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
