'use client'
import React, { createContext, useContext, useState, useEffect } from "react";
import { Popover, Toolbar, Button, IconButton } from "@mui/material";
import IconButtonTooltip from "./IconButtonTooltip";
const TimerContext = createContext();

export const useTimer = () => {
  return useContext(TimerContext);
};

const TimerProvider = ({ children }) => {
  const [isWorkTimerRunning, setIsWorkTimerRunning] = useState(false);
  const [workElapsedTime, setWorkElapsedTime] = useState(0);
  const [idleElapsedTime, setIdleElapsedTime] = useState(() => {
    const currentDate = new Date().toLocaleDateString();
    return parseInt(localStorage.getItem(currentDate + ":IdleTime")) || 0;
  });
  const [isIdleTimerRunning, setIsIdleTimerRunning] = useState(false);
  const [totalWorkTimeToday, setTotalWorkTimeToday] = useState(() => {
    const currentDate = new Date().toLocaleDateString();
    return parseInt(localStorage.getItem(currentDate + ":WorkTime")) || 0;
  });
  const [timerNotification, setTimerNotification] = useState(true);
  const [alreadyTimerIsRunning, setAlreadyTimerIsRunning] = useState(false);

  useEffect(() => {
    let workInterval, idleInterval;

    if (isWorkTimerRunning) {
      workInterval = setInterval(() => {
        setWorkElapsedTime((prevTime) => prevTime + 1);
        setTotalWorkTimeToday((prevTime) => prevTime + 1);
      }, 1000);
      setIsIdleTimerRunning(false); // Reset idle timer when work timer starts
    } else {
      clearInterval(workInterval);
    }

    if (isIdleTimerRunning) {
      idleInterval = setInterval(() => {
        setIdleElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
      setIsWorkTimerRunning(false); // Pause work timer when idle timer starts
    } else {
      clearInterval(idleInterval);
    }

    if(isWorkTimerRunning || isIdleTimerRunning){
        setAlreadyTimerIsRunning(true);
        // Store total work time for the day in local storage
    const currentDate = new Date().toLocaleDateString();
    localStorage.setItem(currentDate + ":TimerRunning", alreadyTimerIsRunning);
    }

    return () => {
      clearInterval(workInterval);
      clearInterval(idleInterval);

    };
  }, [isWorkTimerRunning, isIdleTimerRunning]);

  useEffect(() => {
    // Store total work time for the day in local storage
    const currentDate = new Date().toLocaleDateString();
    localStorage.setItem(currentDate + ":WorkTime", totalWorkTimeToday);
  }, [totalWorkTimeToday]);

  useEffect(() => {
    // Store total work time for the day in local storage
    const currentDate = new Date().toLocaleDateString();
    localStorage.setItem(currentDate + ":IdleTime", idleElapsedTime);
  }, [idleElapsedTime]);

  const startWorkTimer = () => {
    setIsWorkTimerRunning(true);
    setIsIdleTimerRunning(false);
  };

  const stopWorkTimer = () => {
    setIsWorkTimerRunning(false);
    setIsIdleTimerRunning(true);
  };

  const resetWorkTimer = () => {
    setWorkElapsedTime(0);
  };

  const startIdleTimer = () => {
    setIsIdleTimerRunning(true);
  };

  const showTimerNotification = (val) => {
    setTimerNotification(val);
  };

  return (
    <TimerContext.Provider
      value={{
        startWorkTimer,
        stopWorkTimer,
        startIdleTimer,
        resetWorkTimer,
        totalWorkTimeToday,
        workElapsedTime,
        idleElapsedTime,
        isIdleTimerRunning,
        isWorkTimerRunning,
        showTimerNotification,
        timerNotification,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const WorkTimer = ({ displayAs }) => {
  const {
    workElapsedTime,
    startWorkTimer,
    stopWorkTimer,
    resetWorkTimer,
    totalWorkTimeToday,
    idleElapsedTime,
  } = useTimer();
  var rowOrColumn = "column";
  if (displayAs) {
    if (displayAs === "toolbar") {
      rowOrColumn = "row";
    }
  }
  return (
    <>
      <h2
        style={{
          display: "flex",
          flexDirection:  rowOrColumn ,
          gap: "4px",
          alignItems: "center",
          margin: "4px",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", gap: "4px" }}>
          <Button variant="outlined">
            <i icon="line-md:gauge-loop" />
            {Math.floor(workElapsedTime / 60)}:{workElapsedTime % 60}{" "}
          </Button>
          <Button variant="outlined">
            <i icon="game-icons:clockwork" />
            {Math.ceil(totalWorkTimeToday / 60)}{" "}
          </Button>
          <Button variant="outlined">
            <i icon="line-md:moon-rising-twotone-loop" />
            {Math.floor(idleElapsedTime / 60)}:{idleElapsedTime % 60}
          </Button>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <Button variant="contained" onClick={startWorkTimer}>
            <i icon="vaadin:start-cog" />
            &nbsp;Start
          </Button>
          <Button variant="contained" onClick={stopWorkTimer}>
            <i icon="carbon:stop-filled" />
            &nbsp;Stop
          </Button>
          <Button variant="contained" onClick={resetWorkTimer}>
            <i icon="mdi:clock-start" />
            &nbsp;Reset
          </Button>
          <Button
            variant="contained"
            onClick={() => window.open("http://www.gurukulhub.com", "_blank")}
          >
            <i icon="mdi:database-edit-outline" />
            &nbsp;iStore
          </Button>
        </div>
      </h2>
    </>
  );
};

export const IdleTimer = () => {
  const { idleElapsedTime } = useTimer();
  return (
    <h2>
      <Button variant="outlined">
        <i icon="line-md:moon-rising-twotone-loop" />
        {idleElapsedTime}
      </Button>
    </h2>
  );
};

const TimerApp = ({ displayAs }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [showPopup, setShowPopup] = useState(true);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [audio, setAudio] = useState(new Audio("/sample_music.mp3"));

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isTimerStarted) {
        //alert("Venkat")
       setShowPopup(true);
       playAudio();
      } else {
        setShowPopup(false);
        pauseAudio();
      }
    }, 15 * 60 * 1000); // Check every 15 minutes if timers are not active

    return () => clearInterval(intervalId);
  }, [showPopup]);

  const playAudio = () => {
    if (audio && !audio.paused) {
      // If audio is already playing, do nothing
      return;
    }

    // Create a new audio element if it's not already set
    if (!audio) {
      const newAudio = new Audio('/sample_music.mp3');
      setAudio(newAudio);
    }
    else{
 // Play audio
 audio.play();
    }

  };

  const pauseAudio = () => {
    console.log("Pausing audion....")

    if (audio) {
      // Pause the audio if it's playing
      audio.pause();
      console.log("Pausing audion....")
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // setShowPopup(false);
  };
  const handleClose = () => {
    setAnchorEl(null);

  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  if (displayAs === "toolbar")
    console.log("TimerApp:Display as is :" + displayAs+audio);
  return (
    <>
      <TimerProvider>
        {displayAs === "toolbar" ? (
          <div style={{ display: "flex" }}>
            <WorkTimer displayAs="toolbar" />
            <TimerContext.Consumer>
              {(value) => {
                return (
                  !value.isIdleTimerRunning &&
                  showPopup &&
                  !value.isWorkTimerRunning && (
                    <div
                      style={{
                        position: "fixed",
                        top: "5%",
                        left: "40%",
                        transforms: "translate(-50%, -50%)",
                        textAlign: "center",
                        display: "flex",
                        gap: "4px",
                        flexDirection: "column",
                        backgroundColor: "orange",
                        margin: "14px",
                        padding: "14px",
                        borderRadius: "20px",
                        zIndex: 999999,
                      }}
                    >
                      <h2>Welcome to Timer App!</h2>
                      <p>Please start the work timer.</p>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          textAlign: "center",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => {
                            setShowPopup(false);
                            value.startWorkTimer();
                          }}
                        >
                          Start Timer
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setShowPopup(false);
                            pauseAudio()
                             }}
                        >
                          Snooze
                        </Button>
                      </div>
                    </div>
                  )
                );
              }}
            </TimerContext.Consumer>
          </div>
        ) : (
          <div>
            <Toolbar>
              <IconButtonTooltip
              title={"HourGlass"}
                variant="contraint"
                onClick={handleClick}
                color="inherit"
              >
                <i icon="mdi:hourglass" />
              </IconButtonTooltip>
            </Toolbar>
            <TimerContext.Consumer>
              {(value) => {
                return (
                  !value.isIdleTimerRunning &&
                  showPopup &&
                  !value.isWorkTimerRunning && (
                    <div
                      style={{
                        position: "fixed",
                        top: "5%",
                        left: "40%",
                        transforms: "translate(-50%, -50%)",
                        textAlign: "center",
                        display: "flex",
                        gap: "4px",
                        flexDirection: "column",
                        backgroundColor: "orange",
                        margin: "14px",
                        padding: "14px",
                        borderRadius: "20px",
                        zIndex: 999999,
                      }}
                    >
                      <h2>Welcome to Timer App!</h2>
                      <p>Please start the work timer.</p>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          textAlign: "center",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => {
                            setShowPopup(false);
                            value.startWorkTimer();
                          }}
                        >
                          Start Timer
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setShowPopup(false);
                            pauseAudio();
                            //audio.pause();
                         }}
                        >
                          Snooze
                        </Button>
                      </div>
                    </div>
                  )
                );
              }}
            </TimerContext.Consumer>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                }}
              >
                <WorkTimer />
              </div>
            </Popover>
          </div>
        )}
      </TimerProvider>
    </>
  );
};

export default TimerApp;
