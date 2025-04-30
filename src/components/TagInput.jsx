import { useEffect, useRef, useState } from 'react'

import { Cancel } from '@mui/icons-material'
import { Box, TextField, Typography } from '@mui/material'

const Tag = ({ label, onDelete }) => {
  return (
    <Box
      sx={{
        background: 'var(--primary-color)',
        height: '100%',
        width: '100%',
        display: 'flex',
        padding: '0.4rem',
        margin: '0 0.5rem 0 0',
        justifyContent: 'center',
        alignContent: 'center',
        color: '#ffffff'
      }}
    >
      <Typography style={{ color: 'white' }}>{label}</Typography>
      <Cancel sx={{ cursor: 'pointer', marginLeft: '0.5rem' }} onClick={onDelete} />
    </Box>
  )
}

export default function TagInput({ setFormValue, value = [] }) {
  const [tags, setTags] = useState([])
  const tagRef = useRef()

  useEffect(() => {
    setTags(value)
  }, [value])

  const handleDelete = index => {
    const newTags = [...tags]

    newTags.splice(index, 1)
    setTags(newTags)
    setFormValue('tags', newTags)
  }

  const handleOnSubmit = e => {
    e.preventDefault()
    const newTag = tagRef.current.value.trim()

    if (newTag !== '' && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setFormValue('tags', [...tags, newTag])
      tagRef.current.value = ''
    }
  }

  const handleInputChange = () => {
    // Check if input field is empty
    if (tagRef.current.value === '') {
      // Remove the last tag if there are tags present
      if (tags.length > 0) {
        const newTags = [...tags]

        newTags.pop() // Remove the last tag
        setTags(newTags)
        setFormValue('tags', newTags)
      }
    }
  }

  const onkeydown = e => {
    if (e.keycode === 8) {
      console.log('delete')
    }
  }

  const handleInputKeyPress = event => {
    console.log(event.key)

    // Add tag when Enter or comma is pressed
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault() // Prevent default behavior (form submission)
      addTag()
    } else if (event.key === 'Backspace') {
      // event.preventDefault();
      // Check if input field is empty
      if (tagRef.current.value === '') {
        // Remove the last tag if there are tags present
        if (tags.length > 0) {
          const newTags = [...tags]

          newTags.pop() // Remove the last tag
          setTags(newTags)
          setFormValue('tags', newTags)
        }
      }
    }
  }

  const addTag = () => {
    const newTag = tagRef.current.value.trim()

    if (newTag !== '' && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      tagRef.current.value = ''
      setFormValue('tags', [...tags, newTag])
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant='h6' sx={{ margin: '1rem 0 0' }}>
        Tags :
      </Typography>
      <form onSubmit={handleOnSubmit}>
        <div style={{ display: 'flex', overflow: 'auto', padding: '10px', margin: '2px' }}>
          {tags.map((tag, index) => (
            <Tag key={index} label={tag} onDelete={() => handleDelete(index)} />
          ))}
        </div>

        <TextField
          inputRef={tagRef}
          fullWidth
          variant='standard'
          size='small'
          sx={{ margin: '0 0' }}
          placeholder={tags.length < 5 ? 'Enter tags (backspace to remove)' : ''}
          onChange={handleInputChange}
          multiLine={true}
          onKeyDown={handleInputKeyPress}
          //onKeyPress={}
          InputProps={{
            startAdornment: ''
          }}
        />
      </form>
    </Box>
  )
}
