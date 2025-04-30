import React, { useState } from 'react';
import BarcodeGenerator from './BarcodeGenerator'
import BarcodeScanner from './BarcodeScanner';

const RegisterUser = () => {
  const [data, setData] = useState('No barcode detected');

  return (

      <div style={{ textAlign: 'center', padding: '20px' }}>
    <h1>Barcode Generator </h1>
    <BarcodeGenerator />
    <h1>Barcode Scanner </h1>
    { <BarcodeScanner />}
  </div>
  );
};

export default RegisterUser;
