// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AdvListTable from './AdvListTable'

const AdvList = () => {
  return (
    <Grid
      container
      spacing={{ xs: 3, md: 6 }}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        width: '100%',
        margin: 0
      }}
    >
      <Grid item xs={12}>
        <AdvListTable />
      </Grid>
    </Grid>
  )
}

export default AdvList
