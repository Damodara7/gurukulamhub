import React, { useState, useEffect } from 'react'
import SortableTree, { addNodeUnderParent, removeNodeAtPath, changeNodeAtPath } from '@nosferatu500/react-sortable-tree'
import '@nosferatu500/react-sortable-tree/style.css'
import {
  FormControl,
  Input,
  FormControlLabel,
  Radio,
  Button,
  Switch,
  RadioGroup,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Grid,
  Box,
  useTheme,
  alpha
} from '@mui/material'
import useUser from '@/utils/useUser' // Replace with your hook path
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const ContextTreeSearch = ({ setTheFormValue, data = {}, contextType = 'GENERIC' }) => {
  const theme = useTheme()
  console.log({ contextIds: data?.contextIds })

  const initialSelectedNodes = contextType === 'GENERIC' ? data?.genericContextIds : data?.academicContextIds || []
  const [searchString, setSearchString] = useState('')
  const [searchFocusIndex, setSearchFocusIndex] = useState(0)
  const [searchFoundCount, setSearchFoundCount] = useState(0)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState([])

  const [treeData, setTreeData] = useState([
    {
      title: 'AUM (Root)',
      id: 'AUM',
      children: [
        { title: 'Modern Science', id: 'AUM_MSC', children: [{ title: 'Maths', id: 'AUM_MSC_MTH' }] },
        { title: 'Vedic Science', id: 'AUM_VSC', children: [{ title: 'Ganitham', id: 'AUM_VSC_GNT' }] },
        {
          title: 'History',
          id: 'AUM_HIS',
          children: [
            {
              title: 'Religion',
              id: 'AUM_HIS_REL',
              children: [
                {
                  title: 'Hinduism',
                  id: 'AUM_HIS_REL_HIN',
                  children: [
                    { title: 'Ramayana', id: 'AUM_HIS_REL_HIN_RAM' },
                    { title: 'Mahabharata', id: 'AUM_HIS_REL_HIN_MHB' }
                  ]
                },
                { title: 'Judaism', id: 'AUM_HIS_REL_JUD' },
                { title: 'Islam', id: 'AUM_HIS_REL_ISL' }
              ]
            }
          ]
        }
      ]
    }
  ])
  const [treeDataMap, setTreeDataMap] = useState([])
  const [rawTreeData, setRawTreeData] = useState([])
  const [addAsFirstChild, setAddAsFirstChild] = useState(false)

  // Case insensitive search of `node.title`
  // const customSearchMethod = ({ node, searchQuery }) =>
  //   searchQuery &&
  //   node.title.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1
  //   //||
  //node.tags.length > 0 ? node.tags.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1 : ""

  const customSearchMethod = ({ node, searchQuery }) => {
    searchQuery = searchQuery.toLowerCase()

    return (
      node.title.toLowerCase().includes(searchQuery) ||
      (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
    )
  }

  const selectPrevMatch = () =>
    setSearchFocusIndex(
      searchFocusIndex !== null ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount : searchFoundCount - 1
    )

  const selectNextMatch = () =>
    setSearchFocusIndex(searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0)

  const getNodeKey = ({ treeIndex }) => treeIndex

  const handleNodeChecked = node => {
    const newSelectedNodes = [...selectedNodes]
    const index = newSelectedNodes.indexOf(node.id)

    if (index === -1) {
      // Node is being checked
      newSelectedNodes.push(node.id)
    } else {
      // Node is being unchecked
      newSelectedNodes.splice(index, 1)
    }

    setSelectedNodes(newSelectedNodes)
    setTheFormValue(contextType === 'GENERIC' ? 'genericContextIds' : 'academicContextIds', newSelectedNodes)
  }

  const findContextById = id => {
    return treeDataMap.get(id)
  }

  const buildBreadcrumbs = node => {
    const breadcrumbs = []
    let current = node
    //console.log("current",current)
    //console.log("raw data",rawTreeData)
    while (current) {
      //  console.log("breadcrumb current node",current.title,current.parent)
      breadcrumbs.unshift(current)
      current = findContextById(current.parentContextId)
    }
    return breadcrumbs
  }

  const breadcrumbs = selectedNode ? buildBreadcrumbs(selectedNode) : []

  const generateNodeProps = ({ node, path }) => ({
    canDrag: false,
    title: (
      <Box
        component='span'
        sx={{
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.text.primary
        }}
      >
        <input
          type='checkbox'
          style={{
            cursor: 'pointer',
            accentColor: theme.palette.primary.main
          }}
          checked={selectedNodes.includes(node.id)}
          onChange={() => handleNodeChecked(node)}
        />
        {node.title}
      </Box>
    ),

    onClick: () => {
      //handleNodeClick(node);
    }
  })

  const handleAddChild = path => {
    // Logic to create a new child element (e.g., object with title)
    const newChild = { title: 'New Child' }

    // Update treeData by inserting the new child at the specified path
    setTreeData(updateTreeData(treeData, path, newChild))
  }

  const updateTreeData = (data, path, newChild) => {
    const updatedData = [...data]
    let currentNode = updatedData

    // Traverse the tree based on the path to reach the target node
    for (const index of path) {
      currentNode = currentNode[index]?.children // Check for undefined before accessing children
      if (!currentNode) {
        // Handle invalid path (optional: throw error, return early)
        return updatedData
      }
    }

    // Ensure children exist before pushing (initialize if necessary)
    currentNode.children = currentNode.children || []
    currentNode.children.push(newChild)

    return updatedData
  }

  const handleNodeClick = node => {
    //toggleExpanded(node);
    // console.log("Clicked", node);
    console.log('Node.parent', node.parentContextId)
    if (node.parentContextId == null) {
      return
    }
    const processedData = buildPartialTree(rawTreeData, node.parentContextId)

    console.log('Current node....', processedData)
    processedData.expanded = true

    setTreeData([processedData])
    setSelectedNode(processedData)
  }

  const buildTree = (data, parentContextId = null) => {
    return data
      .filter(node => node.parentContextId === parentContextId)
      .map(node => ({
        ...node,
        expanded: true,
        // Add parent information
        parent: parentContextId ? data.find(parentNode => parentNode.id === node.parentContextId) : null,
        children: buildTree(data, node.id)
      }))
  }

  async function getData() {
    // toast.success('Fetching the Contexts now...')
    setLoading(true)
    const result = await RestApi.get(`${ApiUrls.v0.USERS_CONTEXT}?contextType=${contextType}`)
    if (result?.status === 'success') {
      console.log('Context Fetched result', result.result)
      // toast.success('Contexts Fetched Successfully .')
      setLoading(false)
      // Process data if using Parent Reference (optional)
      const processedData = buildTree(result.result)
      console.log('Processed data for intial tree.', processedData)

      setTreeData(processedData || result.result)

      const dataMap = new Map(result.result.map(item => [item.id, item]))
      setTreeDataMap(dataMap)

      const dataMap2 = new Map(result.result.map(item => [item.id, item]))
      setRawTreeData(result.result)

      // handleClose();
    } else {
      // toast.error('Error:' + result?.message)
      setLoading(false)
      setRawTreeData(result?.result)
    }
  }

  useEffect(() => {
    getData()
  }, [contextType])

  const handleNodeSelect = (node, path) => {
    setSelectedNode(node)
    console.log('Selected node', node, path)
  }

  const getChildrenForNode = (nodeId, treeData) => {
    var val = treeData.filter(node => node.parentContextId === nodeId)
    console.log('Children for nodeID:', nodeId, val)
    return val
  }

  const buildPartialTree = (rawTreeData, nodeId) => {
    const node = findContextById(nodeId)
    // console.log("Current node in partial tree.",nodeId,node)

    if (!node) {
      return null // Handle cases where node is not found
    }
    // console.log("Current node in partial tree.",node,rawTreeData)
    const children = getChildrenForNode(nodeId, rawTreeData)
    const childrenWithTree = children.map(child => buildPartialTree(rawTreeData, child.id)) // Recursively build child subtrees

    //node.expanded = true;
    toggleExpanded(node)
    return {
      ...node,
      children: childrenWithTree
    }
  }

  const handleBreadcrumbClick = nodeId => {
    // Find the node with the given id in the original tree data
    const currNode = rawTreeData.find(n => n.id === nodeId)
    console.log('Breadcrmb click', currNode)
    if (currNode.parentContextId === null) {
      //return ;
    }
    // const newTree = buildTree(rawTreeData,nodeId);
    const newTree = buildPartialTree(rawTreeData, nodeId)
    setTreeData([newTree])
    setSelectedNode(newTree)

    console.log('New Tree', newTree)
  }

  const toggleExpanded = node => {
    const newTreeData = [...treeData]
    const nodeIndex = newTreeData.findIndex(n => n.id === node.id)
    newTreeData[nodeIndex] = {
      ...node,
      expanded: !node.expanded
    }
    if (node.expanded) node.expanded = !node.expanded
    else node.expanded = true

    newTreeData.expanded = !node.expanded
    setTreeData(newTreeData)
  }

  const canDrop = ({ node, dragOverNode }) => {
    if (!dragOverNode) {
      return false
    }

    return dragOverNode.depth === 0
  }

  useEffect(() => {
    console.log('changed treeData....', treeData)
    setSelectedNodes(initialSelectedNodes)
  }, [treeData])

  console.log('Selected nodes', selectedNodes)
  console.log('initialSelectedNodes', initialSelectedNodes)

  if (loading)
    return <Typography sx={{ p: 2, color: theme.palette.text.secondary }}>Fetching Subjects Please Wait...</Typography>

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant='h6'
        sx={{ textTransform: 'uppercase', mb: 2, color: theme.palette.text.primary, fontWeight: 700 }}
      >
        Context
      </Typography>
      <form
        onSubmit={event => {
          event.preventDefault()
        }}
      >
        <TextField
          fullWidth
          id='find-box'
          type='text'
          placeholder='Search...'
          size='small'
          value={searchString}
          onChange={event => setSearchString(event.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiInputBase-root': {
              bgcolor: theme.palette.background.default,
              color: theme.palette.text.primary
            }
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            type='button'
            disabled={!searchFoundCount}
            onClick={selectPrevMatch}
            size='small'
            variant='outlined'
            sx={{ minWidth: 36, px: 1 }}
          >
            &lt;
          </Button>

          <Typography variant='body2' sx={{ color: theme.palette.text.primary }}>
            {searchFoundCount > 0 ? searchFocusIndex + 1 : 0} / {searchFoundCount || 0}
          </Typography>

          <Button
            type='submit'
            disabled={!searchFoundCount}
            onClick={selectNextMatch}
            size='small'
            variant='outlined'
            sx={{ minWidth: 36, px: 1 }}
          >
            &gt;
          </Button>
        </Box>
      </form>

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          color: theme.palette.text.secondary
        }}
      >
        {breadcrumbs.map((crumb, index) => (
          <Typography
            key={index}
            onClick={() => handleBreadcrumbClick(crumb.id)}
            sx={{
              cursor: 'pointer',
              color: theme.palette.primary.main,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {crumb.title} {index < breadcrumbs.length - 1 ? '/' : ''}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          height: 300,
          width: '100%',
          bgcolor: theme.palette.background.default,
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          p: 1,
          '& .rst__tree': {
            bgcolor: 'transparent !important'
          },
          '& .rst__node': {
            bgcolor: `${theme.palette.background.paper} !important`
          },
          '& .rst__nodeContent': {
            bgcolor: `${theme.palette.background.paper} !important`,
            color: `${theme.palette.text.primary} !important`,
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.15)} !important`
          },
          '& .rst__rowContents': {
            bgcolor: `${theme.palette.background.paper} !important`,
            color: `${theme.palette.text.primary} !important`,
            borderRadius: '4px !important',
            minWidth: '50px !important'
          },
          '& .rst__lineHalfHorizontalRight::before, & .rst__lineFullVertical::after, & .rst__lineHalfVerticalTop::after, & .rst__lineHalfVerticalBottom::after':
            {
              bgcolor: `${alpha(theme.palette.divider, 0.3)} !important`
            }
        }}
      >
        <SortableTree
          //nodeRenderer={CustomNodeRenderer}
          style={{
            // Inline style for immediate override
            '.rst__rowContents': { minWidth: '50px !important' }
          }}
          onNodeSelect={(node, path) => handleNodeSelect(node, path)}
          onClick={node => handleNodeClick(node)}
          treeData={treeData}
          onChange={setTreeData}
          generateNodeProps={generateNodeProps}
          canDrop={canDrop}
          //
          // Custom comparison for matching during search.
          // This is optional, and defaults to a case sensitive search of
          // the title and subtitle values.
          // see `defaultSearchMethod` in https://github.com/frontend-collective/react-sortable-tree/blob/master/src/utils/default-handlers.js
          searchMethod={customSearchMethod}
          //
          // The query string used in the search. This is required for searching.
          searchQuery={searchString}
          //
          // When matches are found, this property lets you highlight a specific
          // match and scroll to it. This is optional.
          searchFocusOffset={searchFocusIndex}
          //
          // This callback returns the matches from the search,
          // including their `node`s, `treeIndex`es, and `path`s
          // Here I just use it to note how many matches were found.
          // This is optional, but without it, the only thing searches
          // do natively is outline the matching nodes.
          searchFinishCallback={matches => {
            setSearchFoundCount(matches.length)
            setSearchFocusIndex(matches.length > 0 ? searchFocusIndex % matches.length : 0)
          }}
        />
      </Box>
    </Box>
  )
}

export default ContextTreeSearch
