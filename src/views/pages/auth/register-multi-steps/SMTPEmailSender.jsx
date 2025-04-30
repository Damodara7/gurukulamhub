import React, { useState } from 'react'
import { Button } from '@mui/material'
const SMTPEmailSender = () => {
  const [loading, setLoading] = useState(false)

  const sendEmail = async () => {
    setLoading(true)
    console.log('Sending email...')
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'contact@gurukulamhub.com',
          subject: 'Test Email',
          text: 'This is a test email sent from Next.js using SMTP.'
        })
      })

      if (response.ok) {
        console.log('Email sent successfully', await response.json())
      } else {
        console.error('Failed to send email:', response.statusText)
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }

    setLoading(false)
  }

  return (
    <div>
      <Button onClick={sendEmail}>Send the Email</Button>
      {loading && <div>Sending The Email...</div>}
    </div>
  )
}

export default SMTPEmailSender
