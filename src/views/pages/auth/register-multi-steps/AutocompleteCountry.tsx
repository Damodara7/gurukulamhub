// MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
/********** Standard imports.*********************/
import React, { useEffect, useState } from 'react'
import CenterBox from '@components/CenterBox'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig';
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'
//  const [loading, setLoading] = useState(false)
/********************************************/
// Data Imports
import { countries } from '@/data/countries'

type CountryType = (
  | {
      countryCode: string;
      countryDialCode: string;
      code?: string;
      label?: string;
      phone?: string;
      suggested?: undefined;
    }
  | {
    countryCode: string;
    countryDialCode: string;
      code?: string;
      label?: string;
      phone?: string;
      suggested: boolean;
    }
);



const AutocompleteCountry = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryType | null>(null); // Initialize state for selected country

  const handleCountryChange = (event:any,newValue:any) =>{
    console.log("CountryChanged",newValue)
    setSelectedCountry(newValue);
  }

  return (
    <Autocomplete
      autoHighlight
      onChange={handleCountryChange}
      id='autocomplete-country-select'
      options={countries as CountryType[]}
      getOptionLabel={option => option.label || ''}
      //value={}

      renderOption={(props, option) => (
        <Box component='li' {...props} key={option.label}>
          <img
            className='mie-4 flex-shrink-0'
            alt=''
            width='20'
            loading='lazy'
            src={`https://flagcdn.com/w20/${option.code?.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${option.code?.toLowerCase()}.png 2x`}
          />
          {option.label} ({option.code}) +{option.phone}
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          key={params.id}
          label='Choose a country'
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password'
          }}


        />
      )}
      value={selectedCountry} // Set value to selectedCountry state
      //onChange={handleCountryChange2} // Handle change event
    />
  )
}

export default AutocompleteCountry
