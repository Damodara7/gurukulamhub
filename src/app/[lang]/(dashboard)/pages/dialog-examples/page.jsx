// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ReferAndEarn from '@views/pages/refer-earn/ReferAndEarn'

const getPricingData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/pricing`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

const DialogExamples = async () => {
  // Vars
  const data = await getPricingData()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ReferAndEarn />
      </Grid>
    </Grid>
  )
}

export default DialogExamples
