import React, { createContext, useContext, useState } from 'react';

const defaultImportLocation = '.'; // Set the default import location to the current folder

const ImportContext = createContext([defaultImportLocation]);

export const useImportLocations = () => useContext(ImportContext);

export const ImportProvider = ({ children }) => {
  const [importLocations, setImportLocations] = useState([defaultImportLocation]);

  return (
    <ImportContext.Provider value={importLocations}>
      {children}
    </ImportContext.Provider>
  );
};
