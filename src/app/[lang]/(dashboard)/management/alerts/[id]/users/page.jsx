import React from 'react'
// import { getAlertUsersByAlertId } from '@/actions/userAlerts'
import AlertUsersTable from '@/views/apps/alerts/AlertUsersTable'

async function page({ params }) {
  const { id } = params

  // const alertUsers = await getAlertUsersByAlertId({ alertId: id })

  return <AlertUsersTable alertId={id} />
}

export default page
