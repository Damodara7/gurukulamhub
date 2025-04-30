import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useUUID = () => {
  const [uuid, setUUID] = useState(() => uuidv4());

  const regenerateUUID = (prefix = '') => {
    const newUUID = `${prefix}${uuidv4()}`;
    setUUID(newUUID);
    return newUUID;
  };

  const getUUID = (prefix = '') => `${prefix}${uuidv4()}`;

  // Generate a six-digit unique ID
  const generateSixDigitID = () => Math.floor(100000 + Math.random() * 900000).toString();

  return { uuid, regenerateUUID, getUUID, generateSixDigitID };
};

export default useUUID;
