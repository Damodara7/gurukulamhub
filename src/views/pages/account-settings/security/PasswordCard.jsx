'use client'

import React, { useEffect, useState } from 'react'
import ChangePasswordCard from './ChangePasswordCard'
import Loading from './Loading'
import SetPasswordCard from './SetPasswordCard'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { fetchDoesUserHasPassword } from '@/actions/user'
import { Card, CardContent, CardHeader, CircularProgress, Typography } from '@mui/material'
import { toast } from 'react-toastify'

// // Fetch profile data
// export async function fetchDoesUserHasPassword(email) {
//   const result = await RestApi.get(`${ApiUrls.v0.USER}/${email}/does-password-exist`)
//   return result
// }

function PasswordCard({ session }) {
  const [hasPassword, setHasPassword] = useState(null) // if null return loading
  const [err, setErr] = useState(null)
  const [refetchPassword, setRefetchPassword] = useState(false)

  useEffect(() => {
    async function fetchPassword() {
      const doesPasswordExistResult = await fetchDoesUserHasPassword(session?.user?.email)
      if (doesPasswordExistResult?.status === 'success') {
        setErr(null)
        setHasPassword(doesPasswordExistResult?.result) // the result is true / false in success case
      } else {
        setHasPassword(null)
        setErr(doesPasswordExistResult?.message)
      }
    }
    fetchPassword()
  }, [session?.user?.email, refetchPassword])

  function handleChangeOrSetPassword() {
    setHasPassword(null)
    setErr(null)
    setRefetchPassword(prev => !prev)
  }

  let content = <Loading />

  if (err) {
    content = (
      <div className='flex justify-center'>
        <Typography variant='body1'>{err}</Typography>
      </div>
    )
  }

  if (hasPassword === true) {
    content = <ChangePasswordCard onChangePassword={handleChangeOrSetPassword} email={session?.user?.email} />
  } else if (hasPassword === false) {
    content = <SetPasswordCard onSetPassword={handleChangeOrSetPassword} email={session?.user?.email} />
  } else {
    content = <Loading />
  }

  return (
    <Card>
      {hasPassword === true && <CardHeader title='Change Password' />}
      {hasPassword === false && <CardHeader title='Set Password' />}
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default PasswordCard
