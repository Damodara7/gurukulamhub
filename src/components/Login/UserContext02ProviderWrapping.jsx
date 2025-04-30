import React from 'react';
import { UserContext01Provider } from './UserContext01Provider';
import UserContext02ConsumerLogin from './UserContext05ConsumerDisplayLogin';

const UserContext03ProviderWrapping = () => {


  return (
    <UserContext01Provider>
      <UserContext02ConsumerLogin></UserContext02ConsumerLogin>
    </UserContext01Provider>
  );
};

export default UserContext03ProviderWrapping;
