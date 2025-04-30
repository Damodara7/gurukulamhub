import React from 'react';
import useUserInformation from './useGetAwsUserInformation';

const UseUserInformationTest = () => {
  const { user, isLoading, isError } = useUserInformation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error occurred while fetching user information.</div>;
  }

  return (
    <div>
      {/* Render user information */}
    </div>
  );
};

export default UseUserInformationTest;
