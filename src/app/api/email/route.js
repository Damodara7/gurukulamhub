// Next Imports
import { NextResponse } from 'next/server';
import { sendSuccessResponse, sendErrorResponse } from '../../../utils/apiResponses'
import { srvSendEmail } from '@/app/services/mail.service'
import * as UserService from '@/app/services/user.service';

// Add new event
export async function POST(request) {
  console.log("We are inside /api/email post request....")
  try {
    // Given incoming request /home
    var finalResult = await sendEmail(request)
    // Generate new event id
    //event['id'] = events[events.length - 1].id + 1
    const json_response = {
      success: finalResult,
      results: 3
    }
    console.log("Sending response....", json_response)
    // return new event
    return sendSuccessResponse(json_response);
  } catch (error) {
    console.log('[SENDMAIL]', error);
    return sendErrorResponse(error.message);
  }
}

async function sendEmail(req) {
  const body = await req.json()
  console.log("Body Details...", body, req.method)

  const { email, subject, text, action } = body;
  console.log("Inside the nodemailer......", email, subject, text)

  if (action === "verifyEmail") {
    var result = await UserService.srvSendEmailOtp(email,action);
    console.log("Email OTP result:", result);
    return result;
  }
  else{ //normal email
    try {
    var result = await srvSendEmail({ email, subject, content: text });
    //res.status(200).json({ message: 'Email sent successfully' });
    console.log("Sent successfully:", result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    //res.status(500).json({ error: 'Failed to send email' });
    return false;
  }
}
}




