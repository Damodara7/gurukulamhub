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


export async function srvSendSMS(postData: String) {
  try {
    const req = http.request(options, function (res) {
      const chunks: any = []

      res.on('data', function (chunk) {
        chunks.push(chunk)
        console.log(chunks)
      })

      res.on('end', function () {
        const body = Buffer.concat(chunks)
        console.log(body.toString())
        return true
      })
    })

    req.write(postData) // Send the data
    req.end() // Complete the request
  } catch (e) {
    console.error('Error sending sms', e)
    return false
  }
}
