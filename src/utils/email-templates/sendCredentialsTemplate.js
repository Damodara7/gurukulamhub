export const sendCredentialsTemplate = (data, siteLink) => {
    const { email, password, firstName = '', lastName = '' } = data;
    const fullName = [firstName, lastName].filter(Boolean).join(' '); // Combine first and last name if available

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

          .credentials-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }

          .button {
            display: block;
            margin: 0 auto;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
          }

          .button:hover {
            background-color: #0056b3;
          }

          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #999999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to GurukulamHub!</h1>
          <p>
            ${fullName ? `Hi ${fullName},` : 'Hi there,'}
          </p>
          <p>
            We're thrilled to have you on board! GurukulHub is your ultimate platform for Indian knowledge systems
            Below are your login credentials:
          </p>
          <div class="credentials-box">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>
            Click the button below to start your journey of Knowledge!
          </p>
          <a href="${siteLink}" class="button">Go to GurukulamHub</a>
          <div class="footer">
            If you have any questions, feel free to reach out to our support team.
            <br>
            Enjoy your experience with GurukulamHub!
          </div>
        </div>
      </body>
      </html>
    `;
};
