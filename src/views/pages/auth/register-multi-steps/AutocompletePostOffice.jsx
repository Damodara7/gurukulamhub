import React, { useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

const AutocompletePostOffice = ({ loading, postOffices, setSelectedLocality, selectedLocality }) => {
  console.log('post offices: ', postOffices)
  console.log('selected locality: ', selectedLocality)
  const localityValue =
    postOffices?.find(each => each.VillageOrLocalityName + '-' + each['OfficeName'] === selectedLocality) || ''
  return (
    <>
      {!loading && postOffices?.length > 0 && (
        <Autocomplete
          options={postOffices || []}
          value={localityValue}
          onChange={(e, newValue) => {
            console.log('Setting selected locality value', newValue)
            if (newValue) {
              setSelectedLocality(newValue?.VillageOrLocalityName + '-' + newValue['OfficeName'])
            } else {
              setSelectedLocality('')
            }
          }}
          fullWidth
          getOptionLabel={option => (option ? option.VillageOrLocalityName + '-' + option['OfficeName'] : '')}
          renderOption={(props, option) => (
            <Box component='li' {...props}>
              {option.VillageOrLocalityName} - {option['OfficeName']}
            </Box>
          )}
          renderInput={params => <TextField value={localityValue} {...params} label='Choose Your Local PostOffice' />}
        />
      )}
    </>
  )
}

export default AutocompletePostOffice
