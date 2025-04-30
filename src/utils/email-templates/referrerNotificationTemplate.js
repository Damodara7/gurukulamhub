export const referrerNotificationTemplate = ({
  referrerName,
  referrerEmail,
  newUserName,
  newUserEmail,
  newUserMobileNumber,
  referrerMemberId
}) => {
  return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              margin: 0;
              padding: 0;
            }

            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              margin-top: 50px;
            }

            h1 {
              color: #333333;
              text-align: center;
            }

            p {
              color: #666666;
              line-height: 1.5;
            }

            .footer {
              text-align: center;
              margin-top: 20px;
              color: #999999;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hello ${referrerName},</h1>
            <p>
              We are excited to inform you that <b>${newUserName}</b> (Email: <a href="mailto:${newUserEmail}">${newUserEmail}</a>, Mobile: ${newUserMobileNumber})
              has joined GurukulamHub using your Member ID <b>${referrerMemberId}</b> and email <b>${referrerEmail}</b>.
            </p>
            <p>
              If you are not happy with this or believe this was done in error, please inform our administration team.
            </p>
            <p>Thank you for being a valued member of GurukulamHub!</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GurukulamHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
};
