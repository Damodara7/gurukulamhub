import http from 'https'

const options = {
  method: 'POST',
  hostname: 'control.msg91.com',
  port: null,
  path: '/api/v5/flow/',
  headers: {
    authkey: '402357AbaNrR2hbJGo6606c420P1',
    'content-type': 'application/JSON',
    accept: 'application/json'
  }
}



export const getOTPTemplate = (phone:String, otp:String, name:String) =>{
  const template = ` {
    "template_id":"6635e066d6fc056946450622",
    "short_url": "0",
    "recipients": [
      {
        "mobiles": "${phone}",
        "nameVal": "${name}",
        "otpVal": "${otp}"
      }
    ]
  }`;
  return template;
}


export async function srvSendSMS(postData: String): Promise<{ success: boolean; error?: string; response?: any }> {
  return new Promise((resolve, reject) => {
    try {
      const req = http.request(options, function (res) {
        const chunks: any = []

        res.on('data', function (chunk) {
          chunks.push(chunk)
          console.log('[srvSendSMS] Received chunk:', chunk)
        })

        res.on('end', function () {
          try {
            const body = Buffer.concat(chunks)
            const responseText = body.toString()
            console.log('[srvSendSMS] Full response:', responseText)
            
            // Try to parse JSON response
            let responseData: any = {}
            try {
              responseData = JSON.parse(responseText)
            } catch (parseError) {
              console.warn('[srvSendSMS] Could not parse response as JSON:', responseText)
            }

            // Check if response indicates success
            // MSG91 typically returns { "type": "success", "message": "..." } on success
            // or { "type": "error", "message": "..." } on failure
            // Also check HTTP status code
            const httpSuccess = res.statusCode && res.statusCode >= 200 && res.statusCode < 300
            const responseTypeSuccess = responseData.type === 'success'
            
            // Additional validation: check if message contains error indicators
            const message = responseData.message || ''
            const hasErrorMessage = message.toLowerCase().includes('error') || 
                                   message.toLowerCase().includes('fail') ||
                                   message.toLowerCase().includes('invalid') ||
                                   message.toLowerCase().includes('unauthorized')
            
            // Consider it successful only if:
            // 1. HTTP status is success AND
            // 2. Response type is success AND
            // 3. Message doesn't contain error indicators
            const isSuccess = httpSuccess && responseTypeSuccess && !hasErrorMessage
            
            if (isSuccess) {
              console.log('[srvSendSMS] SMS sent successfully, response:', responseData)
              resolve({ success: true, response: responseData })
            } else {
              // Even if type is "success", if HTTP status is not 2xx or message has errors, treat as failure
              const errorMsg = responseData.message || responseData.error || 
                              (responseTypeSuccess ? 'SMS service returned success but may have failed (check API keys)' : 'SMS service returned error response')
              console.error('[srvSendSMS] SMS sending failed:', errorMsg)
              console.error('[srvSendSMS] Response details:', {
                httpStatus: res.statusCode,
                responseType: responseData.type,
                message: responseData.message,
                hasErrorMessage
              })
              resolve({ success: false, error: errorMsg, response: responseData })
            }
          } catch (error: any) {
            console.error('[srvSendSMS] Error processing response:', error)
            resolve({ success: false, error: error.message || 'Failed to process SMS response' })
          }
        })

        res.on('error', function (error) {
          console.error('[srvSendSMS] Response error:', error)
          resolve({ success: false, error: error.message || 'SMS service response error' })
        })
      })

      req.on('error', function (error) {
        console.error('[srvSendSMS] Request error:', error)
        resolve({ success: false, error: error.message || 'SMS service request failed' })
      })

      req.write(postData) // Send the data
      req.end() // Complete the request
    } catch (e: any) {
      console.error('[srvSendSMS] Error sending sms:', e)
      resolve({ success: false, error: e.message || 'Unknown error sending SMS' })
    }
  })
}
