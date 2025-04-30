const useUserInformation = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function getUser() {
      try {
        const { username, userId } = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();

        let email = "";
        let phone = "";

        if (userAttributes) {
          email = userAttributes.email;
          phone = userAttributes.phone;
        }

        if (isMounted) {
          setUser({
            username,
            email,
            userId,
            phone
          });
          setIsLoading(false);
        }
      } catch (error) {
        setIsError(true);
        console.error("Error while retrieving user information:", error);
      }
    }

    getUser();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to ensure useEffect runs only on mount

  return { user, isLoading, isError };
};
