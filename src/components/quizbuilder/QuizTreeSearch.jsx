import React, { useState,useEffect } from 'react'
import  SortableTree, {addNodeUnderParent, removeNodeAtPath, changeNodeAtPath } from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css';
import { FormControl,Input, FormControlLabel, Radio, Button, Switch, RadioGroup, IconButton, Typography, TextField, MenuItem, Select, InputLabel, Grid, Box } from '@mui/material';
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig';

const QuizTreeSearch = ({user}) => {
  const title = 'Hay';

  const [searchString, setSearchString] = useState('');
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  const [searchFoundCount, setSearchFoundCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeData, setTreeData] = useState([]);



const SubjectIcon = () => <span className="ri ri-cloudy-2-line">ss</span>;
const QuizIcon = () => <span  className="ri ri-question-line">sssss</span>;
const CourseIcon = () => <i className=" ri-computer-line"></i>;
const BookIcon = () => <i className=" ri-book-2-line"></i>;
const ErrorIcon = () => <i className="ri-error-warning-line"></i>;


  useEffect(() => {
    const fetchTreeData = async () => {
      const response = await RestApi.get('/api/context'); // Replace with your API endpoint
      const rawData = response?.result;
      //console.log(response);

      const response2 = await RestApi.get('/api/quiz'); // Replace with your API endpoint
      const rawData2 = response2?.result;
     // console.log(response);

      const combinedData = rawData.concat(rawData2)
      // Process data if using Parent Reference (optional)
      const processedData = buildTree(combinedData);
      setTreeData(processedData || combinedData); // Use processed or raw data based on your schema
    };

    fetchTreeData();
  }, []);

  const buildTree = (data, parentContextId = null) => {
    return data.filter(node => node.parentContextId === parentContextId)
      .map(node => ({
        ...node,
        children: buildTree(data, node.id),
      }));
  };


  const [addAsFirstChild, setAddAsFirstChild] = useState(false);

  // Case insensitive search of `node.title`
  const customSearchMethod = ({ node, searchQuery }) =>
    searchQuery &&
    node.title.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1

  const selectPrevMatch = () =>
    setSearchFocusIndex(
      searchFocusIndex !== null
        ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
        : searchFoundCount - 1,
    )

  const selectNextMatch = () =>
    setSearchFocusIndex(
      searchFocusIndex !== null
        ? (searchFocusIndex + 1) % searchFoundCount
        : 0,
    )


      const getNodeKey = ({ treeIndex }) => treeIndex;

    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map((k) => (k === "children" ? "children: Array" : `${k}: '${node[k]}'`))
        .join(",\n   ");

      global.alert(
        "Info passed to the button generator:\n\n" +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(", ")}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    const generateNodeProps = ({ node, path }) =>
      {

        const icon = (() => {
         // console.log("calling icon on node",node)
          switch (node.nodeType) {
            case 'SUBJECT': {
             // console.log("Returning subject icon")
              return <SubjectIcon />;
            }
            case 'QUIZ': return  <QuizIcon /> ;
            case 'COURSE': return  <CourseIcon /> ;
            default: return <ErrorIcon/>;
          }
        })();

      return {
      canDrag: false,
      style: {
        backgroundColor: node.nodeType == 'SUBJECT' ? 'lightblue' : 'red',
      },
      title: (
        <>
        {icon}&nbsp;&nbsp;
        <input
          style={{ fontSize: '1.1rem' , backgroundColor: node.nodeType =='SUBJECT'? 'lightgreen': 'lightblue'}}
          value={node.title}
          readOnly
          onChange={(event) => {
            const title = event.target.value;

            setTreeData(
              changeNodeAtPath({
                treeData,
                path,
                getNodeKey,
                newNode: { ...node, title },
              })
            );
          }}
        />
        </>
      ),
      //buttons: [Icon],
      // buttons: [
      //   icon,
      //   <Button key={path} onClick={() => {
      //     setTreeData(
      //       addNodeUnderParent({
      //         treeData,
      //         parentKey: path[path.length - 1],
      //         expandParent: true,
      //         getNodeKey,
      //         newNode: {
      //           title: `${node.title}-subSubj`,
      //         },
      //         addAsFirstChild,
      //       }).treeData
      //     );
      //   }}>
      //   Add Child
      //   </Button>,
      //   <Button
      //   key={path}
      //   onClick={() => {
      //             setTreeData(
      //               removeNodeAtPath({
      //                 treeData,
      //                 path,
      //                 getNodeKey,
      //               })
      //             );
      //           }}>
      //  Remove
      //   </Button>
      // ],

      onClick: () => {
        handleNodeClick(node);
        //setTheFormValue("contextName",node.title)
        //setTheFormValue("contextId",node.id)
      },
    }};

    const handleAddChild = (path) => {
      // Logic to create a new child element (e.g., object with title)
      const newChild = { title: 'New Child' };

      // Update treeData by inserting the new child at the specified path
      setTreeData(updateTreeData(treeData, path, newChild));
    };

    const updateTreeData = (data, path, newChild) => {
      const updatedData = [...data];
      let currentNode = updatedData;

      // Traverse the tree based on the path to reach the target node
      for (const index of path) {
        currentNode = currentNode[index]?.children; // Check for undefined before accessing children
        if (!currentNode) {
          // Handle invalid path (optional: throw error, return early)
          return updatedData;
        }
      }

      // Ensure children exist before pushing (initialize if necessary)
      currentNode.children = currentNode.children || [];
      currentNode.children.push(newChild);

      return updatedData;
    };

    const handleNodeClick = (node) => {
      setSelectedNode(node);
      //console.log("Clicked",node)
    };



  return (
    <div>
      <h2>Quizzes</h2>
      <form
        style={{ display: 'inline-block' }}
        onSubmit={(event) => {
          event.preventDefault()
        }}>
        <Input
          id="find-box"
          type="text"
          placeholder="Search..."
          style={{ fontSize: '1rem' }}
          value={searchString}
          onChange={(event) =>
            setSearchString(event.target.value)
          }
        />

        <button
          type="button"
          disabled={!searchFoundCount}
          onClick={selectPrevMatch}>
          &lt;
        </button>

        <button
          type="submit"
          disabled={!searchFoundCount}
          onClick={selectNextMatch}>
          &gt;
        </button>

        <span>
          &nbsp;
          {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
          &nbsp;/&nbsp;
          {searchFoundCount || 0}
        </span>
      </form>

      <div style={{ height: 300, width: 700 }}>
        <SortableTree

         //onSelect={(node, path) => handleNodeSelect(node, path)}
         onClick={(node)=>handleNodeClick(node)}
         treeData={treeData}
          onChange={setTreeData}
          generateNodeProps={generateNodeProps}
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
          searchFinishCallback={(matches) => {
            setSearchFoundCount(matches.length);
            setSearchFocusIndex(matches.length > 0 ? searchFocusIndex % matches.length : 0);
          }}
        />
      </div>
    </div>

  )
}

export default QuizTreeSearch;
