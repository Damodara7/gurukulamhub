'use client'
import EditAudiencePage from '@/views/apps/audience/edit-audience'

export default function Page({ params }) {
  const { id } = params
  return <EditAudiencePage audienceId={id} />
}
