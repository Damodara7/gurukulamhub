// components/EmailForm.js

import { useState } from 'react';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [isUnique, setIsUnique] = useState(true);

  const handleEmailChange = async (e) => {
    setEmail(e.target.value);

    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: e.target.value })
      });
      const data = await response.json();
      setIsUnique(data.unique);
    } catch (error) {
      console.error('Error validating email:', error);
    }
  };

  return (
    <div>
      <input type="email" value={email} onChange={handleEmailChange} />
      {!isUnique && <p>Email is already taken</p>}
    </div>
  );
}
