'use client'

import dynamic from 'next/dynamic'
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false })
import classes from './TreeComponent.module.css'
import { Tooltip, Box, Typography } from '@mui/material'
import UserBackgroundLetterAvatar from '@/views/pages/account-settings/network-tree/UserBackgroundLetterAvatar'

const renderCustomNodeElement = ({ nodeDatum, toggleNode, onNodeClick }) => {
  const hasChildren = nodeDatum.children?.length > 0
  const isCollapsed = nodeDatum.__rd3t?.collapsed
  return (
    <g
      onClick={evt => {
        // Prevent event propagation issues
        evt.stopPropagation()
        toggleNode()
        onNodeClick(evt) // Synthetic Event (We Should pass event to it)
      }}
    >
      <foreignObject width='100' height='100' x='-50' y='-10'>
        <Tooltip
          title={
            <Box sx={{ color: 'white' }}>
              <Typography sx={{ color: 'white' }} variant='body2'>
                <strong>Name:</strong> {nodeDatum.name}
              </Typography>
              <Typography sx={{ color: 'white' }} variant='body2'>
                <strong>Email:</strong> {nodeDatum.email}
              </Typography>
              <Typography sx={{ color: 'white' }} variant='body2'>
                <strong>Referral Points:</strong> {nodeDatum.referralPoints}
              </Typography>
            </Box>
          }
          arrow
          placement='top'
        >
          <Box display='flex' justifyContent='center' alignItems='center'>
            <UserBackgroundLetterAvatar name={nodeDatum.name} isCurrentNode />
          </Box>
        </Tooltip>
      </foreignObject>
      <text fill='black' strokeWidth='0.5' x='30' y='20' textAnchor='start'>
        {`${nodeDatum.name}${hasChildren ? (isCollapsed ? '   ▲' : '   ▼') : ''}`}
      </text>
    </g>
  )
}

function TreeComponent({ tree = {} }) {
  console.log(tree)
  const handleNodeClick = (node, event) => {
    console.log('Clicked node:', node)
  }

  const handleLinkClick = (link, event) => {
    console.log('Clicked link:', link)
  }

  return (
    <div className='w-full h-full'>
      <Tree
        data={tree}
        rootNodeClassName={classes.node__root}
        branchNodeClassName={classes.node__branch}
        leafNodeClassName={classes.node__leaf}
        orientation='vertical' // "horizontal"(default), "vertical
        pathFunc='step' // "diagonal"(default) , "elbow" , "straight" , "step"
        zoomable // true by default
        collapsible // true by default
        draggable // true by default
        onLinkClick={handleLinkClick}
        translate={{ x: 200, y: 100 }} //Translates the graph along the x/y axis by the specified amount of pixels. By default, the graph will render in the top-left corner of the SVG canvas.
        onNodeClick={handleNodeClick}
        renderCustomNodeElement={renderCustomNodeElement}
        separation={{
          siblings: 1.2, // Space between sibling nodes (default: 1)
          nonSiblings: 1.3 // Space between non-sibling nodes (default: 1)
        }}
        nodeSize={{ x: 200, y: 100 }} // Adjust node dimensions
      />
    </div>
  )
}

export default TreeComponent