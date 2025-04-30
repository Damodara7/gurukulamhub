import React from 'react';
import { UserContext01Provider } from './UserContext01Provider';
import UserContext05ConsumerDisplayLogin from './UserContext05ConsumerDisplayLogin'

const UserContext04ProviderWrappingDisplayLogin = () => {

  return (
    <UserContext01Provider>
      <UserContext05ConsumerDisplayLogin></UserContext05ConsumerDisplayLogin>
    </UserContext01Provider>
  );
};

export default UserContext04ProviderWrappingDisplayLogin;
