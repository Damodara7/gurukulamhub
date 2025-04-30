import { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const useRoles = () => {
    const [roles, setRoles] = useState(['USER'])
    const [loading, setLoading] = useState(false)
    const [hasFetchedRoles, setHasFetchedRoles] = useState(false)

    useEffect(() => {
        const fetchRoles = async () => {
            if (hasFetchedRoles) return // Skip if already fetched

            setLoading(true)
            try {
                const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
                if (result?.status === 'success') {
                    setRoles(result.result || [])
                    setHasFetchedRoles(true)
                } else {
                    console.error('Error fetching roles:', result?.message)
                }
            } catch (error) {
                console.error('Error fetching roles:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRoles()
    }, [hasFetchedRoles])

    return { roles, loading }
}

export default useRoles
