import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Button } from '@mui/material';

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [data, setData] = useState('No barcode detected');

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Scan a Barcode</h3>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setScanning(!scanning)}
        style={{ marginBottom: '20px' }}
      >
        {scanning ? 'Stop Scanning' : 'Start Scanning'}
      </Button>

      {scanning && (
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={(err, result) => {
            if (result) setData(result.text);
            else setData('No barcode detected');
          }}
        />
      )}

      <p>Scanned Data: {data}</p>
    </div>
  );
};

export default BarcodeScanner;
