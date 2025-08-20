'use client'
import EditGroupPage from '@/views/apps/groups/edit-group'

export default function Page({ params }) {
  const { id } = params
  return <EditGroupPage groupId={id} />
}
