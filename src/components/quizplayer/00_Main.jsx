import { Grid, Typography } from '@mui/material'
import './quizplayer.css'
import LanguageSelect from '../quizbuilder/05_Components/LanguageSelect'
const QuizPlayer = () => {
  return (

    <div id="main-content" data-functional-selector="player-side-bar"
      class=" mainContent">
      <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant='body1'>Select Language to play </Typography>
        <LanguageSelect />
      </Grid>
      </Grid>
    </div>


  )
}

export default QuizPlayer


