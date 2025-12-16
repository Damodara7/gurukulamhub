const LayoutContent = ({ children }) => {
    return (
      <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: '1 1 auto',
            height: '100%',
            overflow: 'hidden',
        }}
      >
        {children}
      </div>
    )
  }

  export default function page({data}){
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <GroupChatPage data={data} />
        </Box>
    )
  }

  function GroupChatPage({data}){
    return (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <SomeHeader/>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <SomeScrollableOverflowingContent data={data} />
            </div>
        </div>
    )
  }