export const sendReferralLinkTemplate = (referralLink, referrerName = 'Your friend') => {
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
  
        .button {
          display: block;
          margin: 0 auto;
          padding: 10px 20px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          text-align: center; /* Added to center the button */
        }
  
        .button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
    <div class="container">
      <h1>You've Been Invited!</h1>
      <p>
        ${referrerName ? `${referrerName} has invited you to join our platform.` : 'Join our platform and get started today!'}
      </p>
      <p>
        Sign up now and enjoy exclusive benefits, including a 30-day free trial.
      </p>
      <a href="${referralLink}" class="button">Accept Invitation</a>
    </div>
  </body>
  </html>
      `;
};
