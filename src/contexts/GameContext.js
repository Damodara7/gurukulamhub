// context/GameContext.js
'use client'
import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameData, setGameData] = useState(null);
  const updateGameData = (data) => {
    setGameData(data);
  };

  return (
    <GameContext.Provider value={{ gameData, updateGameData }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  return useContext(GameContext);
};
