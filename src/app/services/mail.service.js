import nodemailer from 'nodemailer'

export const srvGetVerifyEmailLink = ({ purpose, otp }) => {
  const mailOptions = `<p>Click <a href="${process.env.domain}/verifyemail?token=${otp}">here</a> to
                ${purpose}</p>`
  return mailOptions
}

export const srvGetVerifyEmailOtpContent = (purposeDetail, otp) => {
  return `<p> Please enter OTP : ${otp} to ${purposeDetail}   </p>`
}

export const getPurposeDetail = (purpose) => {
  if (purpose === 'verifyEmail') return 'Verify your email.'
  else if (purpose === 'resetPassword') return 'Reset your password.'
  return "";
}

export const srvSendEmail = async ({ email, subject, content }) => {
  try {
    // Create a nodemailer transport with timeout
    const smtpConfig = getSMTPCredentials('mailer91')
    // Add connection timeout to fail fast (10 seconds max)
    const transporter = nodemailer.createTransport({
      ...smtpConfig,
      connectionTimeout: 10000, // 10 seconds connection timeout
      greetingTimeout: 10000, // 10 seconds greeting timeout
      socketTimeout: 10000, // 10 seconds socket timeout
    })

    // Compose email options
    const mailOptions = {
      from: `gurukulamhub-noreply@triesoltech.com`,
      to: email,
      subject: subject,
      html: content
    }
    // Send the email with a timeout wrapper
    const mailResponse = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email service timeout after 10 seconds')), 10000)
      )
    ])
    console.log('[srvSendEmail] Email response:', {
      messageId: mailResponse.messageId,
      response: mailResponse.response,
      accepted: mailResponse.accepted,
      rejected: mailResponse.rejected
    })
    
    // Check if email was actually accepted by the server
    // nodemailer returns accepted/rejected arrays
    const wasAccepted = mailResponse.accepted && mailResponse.accepted.length > 0
    const wasRejected = mailResponse.rejected && mailResponse.rejected.length > 0
    const hasMessageId = !!mailResponse.messageId
    
    // Email is successful if it has a messageId and was accepted (not rejected)
    const isSuccess = hasMessageId && wasAccepted && !wasRejected
    
    if (isSuccess) {
      console.log('[srvSendEmail] Email sent successfully to:', email)
      return { success: true, response: mailResponse, messageId: mailResponse.messageId }
    } else {
      const errorMsg = wasRejected 
        ? `Email was rejected by server: ${mailResponse.rejected.join(', ')}`
        : !hasMessageId
        ? 'Email service did not return a messageId - email may not have been sent'
        : 'Email sending failed - unknown error'
      console.error('[srvSendEmail] Email sending failed for:', email, errorMsg)
      return { 
        success: false, 
        error: errorMsg, 
        response: mailResponse,
        rejected: mailResponse.rejected,
        accepted: mailResponse.accepted
      }
    }
  } catch (error) {
    console.error('[srvSendEmail] Error sending email to:', email, error.message)
    console.error('[srvSendEmail] Error stack:', error.stack)
    // Return structured error instead of throwing
    return { 
      success: false, 
      error: error.message || 'Unknown error sending email',
      response: null
    }
  }
}

function getSMTPCredentials(config) {

  if (config === 'mailer91') {
    return {
      host: 'smtp.mailer91.com', // SMTP host (e.g., Gmail SMTP)
      port: 587, // SMTP port (e.g., 587 for Gmail)
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'emailer@triesoltech1.com', // Your email address
        pass: 'RQ3DZHW4YoXcDBv2' // Your email password or application-specific password
      },
      tls: {
        rejectUnauthorized: false // Disable certificate verification
      }
    }
  }
  if (config === 'godaddy') {
    return {
      host: 'smtpout.secureserver.net', // SMTP host (e.g., Gmail SMTP)
      port: 465, // SMTP port (e.g., 587 for Gmail)
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'pvr@triesoltech1.com',
        pass: '2024@Triesoltech'
      },
      tls: {
        rejectUnauthorized: false // Disable certificate verification
      }
    }
  }
}
