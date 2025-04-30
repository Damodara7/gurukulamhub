import GenericSelectFilter from '../../GenericSelectFilter'

const PrivacySelectFilter = ({ onChange }) => {
  const options = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'PRIVATE', label: 'Private' }
  ]

  const handlePrivacyChange = value => {
    console.log('Selected Privacy:', value)
    onChange(value)
  }

  return (
    <GenericSelectFilter
      size={'small'}
      label='Privacy'
      options={options}
      defaultValue='PUBLIC'
      onChange={handlePrivacyChange}
    />
  )
}

export default PrivacySelectFilter
