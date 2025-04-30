//402357AbaNrR2hbJGo6606c420P1

import { NextResponse } from 'next/server';
import * as SMSService from '@/app/services/sms.service';
import { sendSuccessResponse,createSuccessResponse} from '@/utils/apiResponses'
import { HttpStatusCode } from '@/utils/HttpStatusCodes';


// Add new event
export async function POST(request) {
  console.log("We are inside /api/sms post request....")
  try {
    // Given incoming request /home
    let response = NextResponse.next();
    var success = await sendSMS(request, response)
    // Generate new event id
    //event['id'] = events[events.length - 1].id + 1
    console.log("Sending response....", success)
    const json_response = {
      success: success,
      results: 3
    }
    const finalResponse = createSuccessResponse(json_response,HttpStatusCode.Ok);
   return sendSuccessResponse(finalResponse );

  } catch (error) {
    console.log('[Send SMS]', error);
    return new NextResponse('Internal Error', { status: 500 })
  }
}


async function sendSMS(request) {
  const postData = await request.json();
  console.log("SendSMS Details...", postData);
  return SMSService.srvSendSMS(JSON.stringify(postData));

}
