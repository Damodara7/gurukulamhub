// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ReferAndEarn from '@views/pages/refer-earn/ReferAndEarn'

const DialogExamples = async () => {

  return (
    <Grid
      container
      spacing={0}
      sx={{
        height: '100%',
        minHeight: 0,
        '& .MuiGrid-item': {
          height: '100%',
          minHeight: 0
        }
      }}
    >
      <Grid item xs={12} sx={{ height: '100%', minHeight: 0 }}>
        <ReferAndEarn />
      </Grid>
    </Grid>
  )
}

export default DialogExamples
