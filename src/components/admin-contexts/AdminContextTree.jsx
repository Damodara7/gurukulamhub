import React, { useState, useEffect } from 'react'
import SortableTree, { addNodeUnderParent, removeNodeAtPath, changeNodeAtPath } from '@nosferatu500/react-sortable-tree'
import '@nosferatu500/react-sortable-tree/style.css'
import { Input, Button, IconButton, useTheme } from '@mui/material'
import useUser from '@/utils/useUser' // Replace with your hook path
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon, Edit as EditIcon } from '@mui/icons-material'
import SearchNavigator from './SearchNavigator'
import IconButtonTooltip from '../IconButtonTooltip'

const AdminContextTree = ({ data, onAddClick = () => {}, onEditClick = () => {}, onRemoveClick = () => {}, headingLabel='Contexts' }) => {
  const title = 'Hay'
  const theme = useTheme()
  const { user, isLoading } = useUser()

  const [initialSelectedNodes, setInitialSelectedNodes] = useState([])
  const [searchString, setSearchString] = useState('')
  const [searchFocusIndex, setSearchFocusIndex] = useState(0)
  const [searchFoundCount, setSearchFoundCount] = useState(0)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState([])

  const [treeData, setTreeData] = useState([
    // {
    //   title: 'AUM (Root)',
    //   id: 'AUM',
    //   children: [
    //     { title: 'Modern Science', id: 'AUM_MSC', children: [{ title: 'Maths', id: 'AUM_MSC_MTH' }] },
    //     { title: 'Vedic Science', id: 'AUM_VSC', children: [{ title: 'Ganitham', id: 'AUM_VSC_GNT' }] },
    //     {
    //       title: 'History',
    //       id: 'AUM_HIS',
    //       children: [
    //         {
    //           title: 'Religion',
    //           id: 'AUM_HIS_REL',
    //           children: [
    //             {
    //               title: 'Hinduism',
    //               id: 'AUM_HIS_REL_HIN',
    //               children: [
    //                 { title: 'Ramayana', id: 'AUM_HIS_REL_HIN_RAM' },
    //                 { title: 'Mahabharata', id: 'AUM_HIS_REL_HIN_MHB' }
    //               ]
    //             },
    //             { title: 'Judaism', id: 'AUM_HIS_REL_JUD' },
    //             { title: 'Islam', id: 'AUM_HIS_REL_ISL' }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // }
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

    // Return false if the search query is empty
    if (!searchQuery) {
      return false
    }

    return (
      node.title.toLowerCase().includes(searchQuery) ||
      node.description.toLowerCase().includes(searchQuery) ||
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

  //   const handleNodeChecked = node => {
  //     const newSelectedNodes = [...selectedNodes]
  //     const index = newSelectedNodes.indexOf(node.id)

  //     if (index === -1) {
  //       newSelectedNodes.push(node.id)
  //     } else {
  //       newSelectedNodes.splice(index, 1)
  //     }

  //     setSelectedNodes(newSelectedNodes)
  //     // setTheFormValue('contextIds', newSelectedNodes.toString())
  //   }

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

  const generateNodeProps = ({ node, path }) => {
    console.log({ node, path })
    const isMatched = searchString && node.title.toLowerCase().includes(searchString.toLowerCase())
    const isFocused = searchFocusIndex !== null && searchFocusIndex === path

    return {
      canDrag: false,
      title: (
        <>
          <span
            style={{ fontSize: '1.1rem', color: isMatched ? theme.palette.primary.main : 'inherit' }}
            value={node.title}
            readOnly
            width='100%'
          >
            {/* <input type='checkbox' checked={selectedNodes.includes(node.id)} onChange={() => handleNodeChecked(node)} /> */}
            {node.title}
          </span>
        </>
      ),

      buttons: [
        <IconButtonTooltip
        title={"Add node"}
          key={path}
          // color='primary'
          onClick={() => {
            console.log('Clicked add node')
            onAddClick({ node: node })
            //   setTreeData(
            //     addNodeUnderParent({
            //       treeData,
            //       parentKey: path[path.length - 1],
            //       expandParent: true,
            //       getNodeKey,
            //       newNode: {
            //         title: `${node.title}-subSubj`
            //       },
            //       addAsFirstChild
            //     }).treeData
            //   )
          }}
        >
          <AddCircleIcon /> {/* Add Child Icon */}
        </IconButtonTooltip>,
        <IconButtonTooltip
        title={"Remove Node"}
          key={path}
          // color='primary'
          disabled
          onClick={() => {
            console.log('Clicked remove node')
            //   setLoading(true)
            onRemoveClick({ node: node })
            //   setTreeData(
            //     removeNodeAtPath({
            //       treeData,
            //       path,
            //       getNodeKey
            //     })
            //   )
          }}
        >
          <RemoveCircleIcon /> {/* Remove Icon */}
        </IconButtonTooltip>,
        <IconButtonTooltip
        title={"Edit Node"}
          key={`${path}-edit`}
          // color='primary'
          onClick={() => {
            console.log('Clicked edit node')
            onEditClick({ node: node })
          }}
        >
          <EditIcon /> {/* Edit Icon */}
        </IconButtonTooltip>
      ],
      onClick: () => {
        //handleNodeClick(node);
      }
    }
  }

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
    setLoading(false)
    // Process data if using Parent Reference (optional)
    const processedData = buildTree(data)
    console.log('Processed data for intial tree.', processedData)

    setTreeData(processedData || data)

    const dataMap = new Map(data.map(item => [item.id, item]))
    setTreeDataMap(dataMap)

    const dataMap2 = new Map(data.map(item => [item.id, item]))
    setRawTreeData(data)
  }

  useEffect(() => {
    if (data) {
      getData()
    }
  }, [data])

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
    // setTheFormValue('parentContextId', [])
  }, [treeData])

  console.log('Selected nodes', selectedNodes)
  console.log('initialSelectedNodes', initialSelectedNodes)

  if (loading) return <>Fetching Subjects Please Wait...</>

  return (
    <div className='w-full'>
      <h2 className='uppercase'>{headingLabel}</h2>
      <form
        onSubmit={event => {
          event.preventDefault()
        }}
      >
        <Input
          fullWidth
          id='find-box'
          className='mb-2'
          type='text'
          placeholder='Search...'
          style={{ fontSize: '1rem' }}
          value={searchString}
          onChange={event => setSearchString(event.target.value)}
        />
        <SearchNavigator
          searchFoundCount={searchFoundCount}
          searchFocusIndex={searchFocusIndex}
          selectPrevMatch={selectPrevMatch}
          selectNextMatch={selectNextMatch}
        />
      </form>

      <div className='breadcrumbs'>
        {breadcrumbs.map((crumb, index) => (
          <span key={index} onClick={() => handleBreadcrumbClick(crumb.id)}>
            {crumb.title} /
          </span>
        ))}
      </div>

      <div style={{ height: '75vh', width: '100%' }}>
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
      </div>
    </div>
  )
}

export default AdminContextTree
