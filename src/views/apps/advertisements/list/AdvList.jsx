// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AdvListTable from './AdvListTable'

const AdvList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AdvListTable />
      </Grid>
    </Grid>
  )
}

export default AdvList
