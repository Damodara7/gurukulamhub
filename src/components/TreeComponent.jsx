'use client'

import dynamic from 'next/dynamic'
const Tree = dynamic(() => import('react-d3-tree'), { ssr: false })
import classes from './TreeComponent.module.css'
import { Tooltip, Box, Typography, useTheme, alpha, useMediaQuery } from '@mui/material'
import { useMemo } from 'react'
import UserBackgroundLetterAvatar from '@/views/pages/account-settings/network-tree/UserBackgroundLetterAvatar'

function TreeComponent({ tree = {} }) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  console.log(tree)

  const handleNodeClick = (node, event) => {
    console.log('Clicked node:', node)
  }

  const handleLinkClick = (link, event) => {
    console.log('Clicked link:', link)
  }

  // Responsive translate values
  const translate = useMemo(() => {
    if (isMobile) {
      return { x: 120, y: 80 }
    } else if (isTablet) {
      return { x: 160, y: 90 }
    }
    return { x: 200, y: 100 }
  }, [isMobile, isTablet])

  // Responsive node size
  const nodeSize = useMemo(() => {
    if (isMobile) {
      return { x: 150, y: 80 }
    } else if (isTablet) {
      return { x: 175, y: 90 }
    }
    return { x: 200, y: 100 }
  }, [isMobile, isTablet])

  // Responsive separation values
  const separation = useMemo(() => {
    if (isMobile) {
      return {
        siblings: 1.0,
        nonSiblings: 1.1
      }
    } else if (isTablet) {
      return {
        siblings: 1.1,
        nonSiblings: 1.2
      }
    }
    return {
      siblings: 1.2,
      nonSiblings: 1.3
    }
  }, [isMobile, isTablet])

  // Responsive foreignObject dimensions
  const foreignObjectSize = useMemo(() => {
    if (isMobile) {
      return { width: 80, height: 80, x: -40, y: -10 }
    } else if (isTablet) {
      return { width: 90, height: 90, x: -45, y: -10 }
    }
    return { width: 100, height: 100, x: -50, y: -10 }
  }, [isMobile, isTablet])

  // Responsive text positioning
  const textPosition = useMemo(() => {
    if (isMobile) {
      return { x: 25, y: 18, fontSize: '12px' }
    } else if (isTablet) {
      return { x: 28, y: 19, fontSize: '13px' }
    }
    return { x: 30, y: 20, fontSize: '14px' }
  }, [isMobile, isTablet])

  const renderCustomNodeElement = ({ nodeDatum, toggleNode, onNodeClick }) => {
    const hasChildren = nodeDatum.children?.length > 0
    const isCollapsed = nodeDatum.__rd3t?.collapsed
    const textColor = isDarkMode ? theme.palette.common.white : theme.palette.text.primary

    return (
      <g
        onClick={evt => {
          // Prevent event propagation issues
          evt.stopPropagation()
          toggleNode()
          onNodeClick(evt) // Synthetic Event (We Should pass event to it)
        }}
      >
        <foreignObject
          width={foreignObjectSize.width}
          height={foreignObjectSize.height}
          x={foreignObjectSize.x}
          y={foreignObjectSize.y}
        >
          <Tooltip
            title={
              <Box>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'white',
                    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                    mb: 0.5
                  }}
                >
                  <strong>Name:</strong> {nodeDatum.name}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'white',
                    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                    mb: 0.5
                  }}
                >
                  <strong>Email:</strong> {nodeDatum.email}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'white',
                    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                  }}
                >
                  <strong>Referral Points:</strong> {nodeDatum.referralPoints}
                </Typography>
              </Box>
            }
            arrow
            placement='top'
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: isDarkMode
                    ? alpha(theme.palette.common.black, 0.9)
                    : alpha(theme.palette.grey[900], 0.9),
                  borderRadius: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                }
              },
              arrow: {
                sx: {
                  color: isDarkMode
                    ? alpha(theme.palette.common.black, 0.9)
                    : alpha(theme.palette.grey[900], 0.9)
                }
              }
            }}
          >
            <Box display='flex' justifyContent='center' alignItems='center'>
              <UserBackgroundLetterAvatar name={nodeDatum.name} isCurrentNode />
            </Box>
          </Tooltip>
        </foreignObject>
        <text
          fill={textColor}
          strokeWidth='0.5'
          x={textPosition.x}
          y={textPosition.y}
          textAnchor='start'
          fontSize={textPosition.fontSize}
          style={{
            fontWeight: 500,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {`${nodeDatum.name}${hasChildren ? (isCollapsed ? '   ▲' : '   ▼') : ''}`}
        </text>
      </g>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        '& svg': {
          width: '100%',
          height: '100%'
        },
        '& .rd3t-link': {
          stroke: isDarkMode
            ? alpha(theme.palette.primary.main, 0.4)
            : alpha(theme.palette.primary.main, 0.6),
          strokeWidth: isMobile ? 1.5 : 2,
          fill: 'none'
        },
        '& .rd3t-link:hover': {
          stroke: theme.palette.primary.main,
          strokeWidth: isMobile ? 2 : 2.5
        }
      }}
    >
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
        translate={translate}
        onNodeClick={handleNodeClick}
        renderCustomNodeElement={renderCustomNodeElement}
        separation={separation}
        nodeSize={nodeSize}
      />
    </Box>
  )
}

export default TreeComponent