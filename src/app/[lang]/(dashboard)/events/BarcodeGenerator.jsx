import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { TextField, Button } from '@mui/material';

const BarcodeGenerator = () => {
  const [input, setInput] = useState('');

  return (
    <div>
      <TextField
        label="Enter Barcode Text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setInput(input)}
        style={{ marginTop: '10px' }}
      >
        Generate Barcode
      </Button>
      {input && (
        <div style={{ marginTop: '20px' }}>
          <Barcode value={input} />
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;
