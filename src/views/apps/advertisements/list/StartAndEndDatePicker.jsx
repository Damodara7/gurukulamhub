// React Imports
import { useState, forwardRef } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

// Third-party Imports
import { format, addDays } from 'date-fns'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

const StartAndEndDatePicker = ({label,formData,setFormData,pStartDate,pEndDate}) => {
  // States
  const [startDate, setStartDate] = useState(pStartDate? pStartDate: new Date())
  const [endDate, setEndDate] = useState(addDays(pEndDate ? pEndDate: new Date(), 15))
  const [startDateRange, setStartDateRange] = useState(new Date())
  const [endDateRange, setEndDateRange] = useState(addDays(new Date(), 45))

  const handleOnChange = dates => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
    setFormData({ ...formData, startDate:start, endDate:end });
    console.log("dates:",end,start);

  }

  const handleOnChangeRange = dates => {
    const [start, end] = dates

    setStartDateRange(start)
    setEndDateRange(end)
  }

  const CustomInput = forwardRef((props, ref) => {
    const { label, start, end, ...rest } = props

    const startDate = format(start, 'MM/dd/yyyy')
    const endDate = end !== null ? ` - ${format(end, 'MM/dd/yyyy')}` : null

    const value = `${startDate}${endDate !== null ? endDate : ''}`

    return <TextField fullWidth inputRef={ref} {...rest} label={label} value={value} />
  })

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AppReactDatepicker
          selectsRange
          endDate={endDate}
          selected={startDate}
          startDate={startDate}
          id='date-range-picker'
          onChange={handleOnChange}
          shouldCloseOnSelect={true}
          customInput={<CustomInput label={label? label:"Start & End Date Range"} start={startDate} end={endDate} />}
        />
      </Grid>
      {/* <Grid item xs={12}>
        <AppReactDatepicker
          selectsRange
          monthsShown={2}
          endDate={endDateRange}
          selected={startDateRange}
          startDate={startDateRange}
          shouldCloseOnSelect={false}
          id='date-range-picker-months'
          onChange={handleOnChangeRange}
          customInput={<CustomInput label='Multiple Months' end={endDateRange} start={startDateRange} />}
        />
      </Grid> */}
    </Grid>
  )
}

export default StartAndEndDatePicker
