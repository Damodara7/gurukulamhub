'use client'
import React, { useState,useEffect } from 'react'
import { Tabs, Tab, Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Grid } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { toast } from 'react-toastify'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
// Simulated data for players and games
const playersData = [
  { id: 1, name: 'Player 1', status: 'active' },
  { id: 2, name: 'Player 2', status: 'inactive' },
  { id: 3, name: 'Player 3', status: 'active' },
]



const GameTabs = ({gameId}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [gameStatus, setGameStatus] = useState()
  const [loading, setLoading] = useState(false)
  const [gameData, setGameData] = useState();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Handle game start
  const handleStartGame = () => {
    setGameStatus('started')
    // Here you would send a request to start the game and update the backend status
    console.log('Game started')
  }


  async function getGameData(gameId) {
    //toast.success('Fetching My Game Data now...')
    setLoading(true)
    const result = await RestApi.get(`${ApiUrls.v0.USERS_GAME_LIVE}/${gameId}`)
    if (result?.status === 'success') {
      console.log('Game Fetched result', result)
      // toast.success('Games Fetched Successfully .')
      setLoading(false)
      // Sort games by startDate
      if (Object.keys(result.result).length === 0) {
        console.log('No data exists');
        toast.error(result.message);
        setLoading(false)
        setGameData(null)
        return
      }
      setGameData(result.result)

    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching games:', result)
      setLoading(false)
      setGameData(null)
    }
  }

  useEffect(() => {
    getGameData(gameId)
  }, [gameId])


  return (
    <Box sx={{ padding: 4 }}>
      {/* Game Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5'>Game ID: {gameId}</Typography>
        <Typography variant='h6'>Title: {gameData?.title}</Typography>
        <Typography variant='body1'>Quiz ID: {gameData?.quizId}</Typography>
        <Typography variant='body1'>
          Status: {gameStatus === 'started' ? 'Started' : 'Not Started'}
        </Typography>
        {gameStatus === 'not_started' && (
          <Button
            variant='contained'
            color='primary'
            sx={{ mt: 2 }}
            onClick={handleStartGame}
          >
            Start Game
          </Button>
        )}
        {gameStatus === 'started' && (
          <Typography variant='body1' sx={{ mt: 2 }}>
            Started At: {new Date(gameData?.startTime).toLocaleString()}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="game tabs">
        <Tab label="Questions Board" />
        <Tab label="Players" />
        <Tab label="Leader Board" />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Questions Board Tab Content */}
        <Typography>Questions will be displayed here...</Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Players Tab Content */}
        <PlayersTab players={playersData} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Leader Board Tab Content */}
        <Typography>Leader Board will be displayed here...</Typography>
      </TabPanel>
    </Box>
  )
}

// Helper for rendering tabs content
function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

// Players Tab Component
const PlayersTab = ({ players }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Player Name</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {players.map(player => (
          <TableRow key={player.id}>
            <TableCell>{player.name}</TableCell>
            <TableCell>
              <Typography
                color={player.status === 'active' ? 'green' : 'red'}
              >
                {player.status}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default GameTabs
