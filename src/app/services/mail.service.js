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
    // Create a nodemailer transport
    const transporter = nodemailer.createTransport(getSMTPCredentials('mailer91'))

    // Compose email options
    const mailOptions = {
      from: `gurukulamhub-noreply@triesoltech.com`,
      to: email,
      subject: subject,
      html: content
    }
    // Send the email
    const mailResponse = await transporter.sendMail(mailOptions)
    return mailResponse
  } catch (error) {
    throw new Error(error.message)
  }
}

function getSMTPCredentials(config) {

  if (config === 'mailer91') {
    return {
      host: 'smtp.mailer91.com', // SMTP host (e.g., Gmail SMTP)
      port: 587, // SMTP port (e.g., 587 for Gmail)
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'emailer@triesoltech.com', // Your email address
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
        user: 'pvr@triesoltech.com',
        pass: '2024@Triesoltech'
      },
      tls: {
        rejectUnauthorized: false // Disable certificate verification
      }
    }
  }
}
