import React from 'react';
import { useUser } from './UserContext01Provider';

const UserContext03ConsumerSettingLogin = () => {
  const { setUserInformation } = useUser();

  // Simulated login function
  const handleLogin = () => {
    // Call your login API or perform authentication logic here
    // Once login is successful, set the user information
    const userInfo = { username: 'exampleUser', email: 'user@example.com' };
    setUserInformation(userInfo);
  };

  return (
    <div>
      <h2>Login Component provided with user context</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default UserContext03ConsumerSettingLogin;
