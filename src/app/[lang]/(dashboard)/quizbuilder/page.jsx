import QuizAuthoringDashboard from '@components/quizbuilder/00_Main/QuizAuthoringDashboard'
import React from 'react'
// Create a context for data access client

function Page() {
  // const [user, setUser] = useState({
  //   username: '',
  //   email: '',
  //   userId: '',
  //   phone: ''
  // })

  // const [isLoading, setIsLoading] = useState(true);
  // const [isError, setIsError] = useState(false)

  // useEffect(() => {
  //   async function getUser() {
  //     try {
  //       //const { username, userId } = await getCurrentUser();
  //       //const userAttributes = await fetchUserAttributes();
  //       var email = "";
  //       var phone = "";
  //       //  console.log('Email:', userAttributes.email);
  //       // if (userAttributes) {
  //       //   email = userAttributes.email;
  //       //   phone = userAttributes.phone;
  //       // }

  //       // console.log("username,uid,email,phone..", username, userId, email, phone)
  //       // setUser({
  //       //   username: username,
  //       //   email: email,
  //       //   userId: userId,
  //       //   phone: phone
  //       // });
  //       setIsLoading(false);
  //     } catch (error) {
  //       setIsError(true)
  //       console.log("PROTECTED PAGE: Error while retrieving user login information..Try relogin");
  //     }
  //   }
  //   getUser();
  // }, [])

  return (
    <>
      <QuizAuthoringDashboard />
      {/* <QuizBuilder user={user} />  */}
    </>
  )
}

export default Page
