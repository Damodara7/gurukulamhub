import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'

const useUser = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession()
      setUser(session?.user || null) // Set user to null if not authenticated
      setIsLoading(false)
    }

    fetchUser()
  }, [])

  return { user, isLoading }
}

export default useUser
