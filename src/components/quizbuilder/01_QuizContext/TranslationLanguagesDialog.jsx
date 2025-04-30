import React, { useState } from 'react'
import { Dialog, DialogContent, Grid, Typography, FormControl, DialogActions, Button } from '@mui/material'
import LanguageSelect from '../05_Components/LanguageSelect'

function TranslationLanguagesDialog({ open, onClose, onTranslate, quiz }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  let quizLanguages = []
  if (quiz) {
    quizLanguages =
      [
        { ...quiz.language, isPrimaryLanguage: true },
        ...quiz.secondaryLanguages.map(lang => ({ ...lang, isPrimaryLanguage: false }))
      ] || []
  }

  const onSelect = language => {
    setSelectedLanguage(language)
  }

  const handleTranslate = () => {
    onTranslate(quiz._id, selectedLanguage)
  }

  return (
    <Dialog title='Select Secondary Language' open={open} onClose={onClose}>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant='body1'>Select a language to translate the quiz.</Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              {/* <InputLabel id='language-select-label'> Language</InputLabel> */}
              <LanguageSelect removeLanguages={quizLanguages} onSelectLanguage={onSelect} />
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='error' variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleTranslate}
          variant='contained'
          component='label'
          style={{ color: 'white' }}
          color='primary'
          disabled={!selectedLanguage}
        >
          Translate
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TranslationLanguagesDialog
