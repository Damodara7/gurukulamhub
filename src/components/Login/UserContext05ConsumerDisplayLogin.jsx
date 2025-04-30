import React from 'react';
import { useUser } from './UserContext01Provider';

const UserContext05ConsumerDisplayLogin = () => {
  const { user } = useUser();

  return (
    <div>
      <h2>Login Component Displaying User details: {user?.username}</h2>
    </div>
  );
};

export default UserContext05ConsumerDisplayLogin;
