const ColumnBox = ({ children, hidden }) => {
  if (hidden === true) {
    return (
      <div style={{ margin: 'auto', flexDirection: 'column', display: 'none', justifyContent: 'center' }}>
        {children}
      </div>
    )
  }
  return (
    <div style={{ margin: 'auto', flexDirection: 'column', display: 'flex', justifyContent: 'center' }}>{children}</div>
  )
}

export default ColumnBox
