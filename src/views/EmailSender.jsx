import React, { useEffect } from 'react';

const EmailSender = () => {
  useEffect(() => {
    const sendEmail = async () => {
      const data = {
        "recipients": [{
          "to": [{
            "email": "parsi.venkatramana@gmail.com",
            "name": "parsi venkat"
          }]
        }],
        "from": {
          "email": "no-reply@mail.gurukulhub.com"
        },
        "domain": "mail.gurukulhub.com",
        "template_id": "global_otp"
      };

      try {
        const response = await fetch("https://control.msg91.com/api/v5/email/send", {
          method: "POST",
          headers: {
            "authkey": "402357AbaNrR2hbJGo6606c420P1",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData);
        } else {
          console.error("Failed to send email:", response.statusText);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    sendEmail();
  }, []); // Empty dependency array ensures this effect runs only once on component mount

  return <div>Sending email...</div>;
};

export default EmailSender;
