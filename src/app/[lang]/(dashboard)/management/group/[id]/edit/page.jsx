'use client'
import EditGroupPage from '@/views/apps/group/edit-group'

export default function Page({ params }) {
  const { id } = params
  return <EditGroupPage groupId={id} />
}
