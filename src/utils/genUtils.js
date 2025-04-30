
// Generate a six-digit unique ID
export const generateSixDigitUniqueId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateEightDigitUniqueId = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const getUniqueIdOfTimestamp = () =>{
  const val = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return val;
  }
