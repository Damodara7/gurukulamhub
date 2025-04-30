'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Grid } from '@mui/material'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import LiveTvOutlinedIcon from '@mui/icons-material/LiveTvOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ActiveIcon from '@mui/icons-material/PlayCircleOutlineOutlined' // Placeholder for "Active" tab
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ActiveGames from '@/views/game/ActiveGames'
import LiveGames from '@/views/game/LiveGames'
import ArchivedGames from '@/views/game/ArchivedGames'
import * as RestApi from '@/utils/restApiUtil'
import { toast } from 'react-toastify'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'

// Keyframe animation for blinking
const blinkAnimation = {
  '@keyframes blink': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0 },
    '100%': { opacity: 1 }
  }
}

const MyGamesView = () => {
  const [value, setValue] = useState('active')
  const [myGames, setMyGames] = useState([])
  const [activeGames, setActiveGames] = useState([])
  const [liveGames, setLiveGames] = useState([])
  const [archivedGames, setArchivedGames] = useState([])

  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const isGameStarted = startedAt => {
    const now = Date.now()
    return new Date(startedAt).getTime() <= now
  }

  async function getGameData() {
    //toast.success('Fetching My Game Data now...')
    setLoading(true)
    const result = await RestApi.get(`${ApiUrls.v0.USERS_GAME}?email=${session?.user?.email}`)
    if (result?.status === 'success') {
      console.log('Games Fetched result', result)
      // toast.success('Games Fetched Successfully .')
      setLoading(false)
      // Sort games by startDate
      if (Object.keys(result.result).length === 0) {
        console.log('No data exists');
        toast.error(result.message);
        setLoading(false)
        setMyGames([])
        return
      } 

      setLiveGames(result.result.liveGames);
      setArchivedGames(result.result.archiveGames);
      setActiveGames(result.result.activeGames);

      return;
     
      const sortedGames = result?.result?.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setMyGames(sortedGames);
      const now = Date.now()
      const twoHoursInMilliseconds = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

      // Active games (excluding live games and those that have elapsed for more than 2 hours)
      const activeGames = sortedGames.filter(game => {
        const startTime = new Date(game.startDate).getTime();
        var elapsedTime = now - startTime;
        elapsedTime = Math.abs(elapsedTime);
        return (game.gameStatus === 'active')
       // return (game.gameStatus === 'active' && game.startDate==="" ) || (game.gameStatus ==='active' && !isGameStarted(game.startDate)) //&& elapsedTime <= twoHoursInMilliseconds;
      });
      //let activeGames = result.result.filter(game => game.gameStatus === 'active' && !isGameStarted(game.startDate));
      setActiveGames(activeGames);
      const liveGames = sortedGames.filter(game => {
        const startTime = new Date(game.startDate).getTime();
        var elapsedTime = now - startTime;
        elapsedTime = Math.abs(elapsedTime);
       // console.log("Elapsed time",elapsedTime,twoHoursInMilliseconds,elapsedTime<= twoHoursInMilliseconds)
         return game.gameStatus=== 'live';
       // return game.gameStatus === 'live' || (elapsedTime <= twoHoursInMilliseconds && isGameStarted(game.startDate))
      })
      setLiveGames(liveGames)
      const archivedGames = sortedGames.filter(game => {
        const startTime = new Date(game.startDate).getTime();
        var elapsedTime = now - startTime;
        return game.gameStatus === 'archive' // || elapsedTime >= twoHoursInMilliseconds;
      });
      setArchivedGames(archivedGames);
    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching games:', result)
      setLoading(false)
      setMyGames([])
    }
  }

  useEffect(() => {
    getGameData()
  }, [])

  return (
    <>
      <TabContext value={value}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Tabs value={value} sx={{padding:"0px"}} onChange={handleChange} variant='fullWidth' aria-label='game tabs'>
            <Tab
                value='active'
                sx={{width:"75", minWidth:""}}
                label={
                  <div className='flex items-center gap-1'>
                    <ActiveIcon />
                    Active
                  </div>
                }
              />
              <Tab
                value='live'
                sx={{width:"75",minWidth:""}}

                label={
                  <div className='flex items-center gap-1'>
                    <LiveTvOutlinedIcon
                      sx={{
                        color: 'red',
                        animation: 'blink 1s infinite', // Add blinking effect
                        ...blinkAnimation // Apply keyframe animation
                      }}
                    />
                    Live
                  </div>
                }
              />
            <Tab
                value='archive'
                sx={{width:"75",minWidth:""}}

                label={
                  <div className='flex items-center gap-1'>
                    <ArchiveOutlinedIcon />
                    Arch
                  </div>
                }
              />

              <Tab
                value='fav'
                sx={{width:"75",minWidth:""}}
                label={
                  <div className='flex items-center gap-1'>
                    <FavoriteIcon />
                    Fav
                  </div>
                }
              />
              <Tab
                value='sub'
                sx={{width:"75",minWidth:""}}

                label={
                  <div className='flex items-center gap-1'>
                    <NotificationsIcon />
                    Sub
                  </div>
                }
              />


            </Tabs>
          </Grid>

          <Grid item xs={12}>
            <TabPanel value='active'>
              <ActiveGames activeGames={activeGames} />
            </TabPanel>
            <TabPanel value='live'>
              <LiveGames liveGames={liveGames} />
            </TabPanel>
            <TabPanel value='archive'>
              <ArchivedGames archivedGames={archivedGames} />
            </TabPanel>
            <TabPanel value='fav'>
              {/* <ArchivedGames archivedGames={archivedGames} /> */}
            </TabPanel>
            <TabPanel value='sub'>
              {/* <ArchivedGames archivedGames={archivedGames} /> */}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default MyGamesView
