// UserContext.js
import React, { createContext, useState, useContext } from 'react';

// Create a context to hold user information
const UserContext = createContext();

// Custom hook to access the user context
export const useUser = () => useContext(UserContext);

// UserProvider component to wrap your app and provide user context
export const UserContext01Provider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to set user information
  const setUserInformation = (userInfo) => {
    setUser(userInfo);
  };

  return (
    <UserContext.Provider value={{ user, setUserInformation }}>
      {children}
    </UserContext.Provider>
  );
};
