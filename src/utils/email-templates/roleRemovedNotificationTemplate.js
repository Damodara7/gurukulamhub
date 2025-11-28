export const roleRemovedNotificationTemplate = ({
  userName,
  userEmail,
  roleName,
  remainingRoles,
  siteLink
}) => {
  const remainingRolesList = remainingRoles && remainingRoles.length > 0 
    ? remainingRoles.map(role => `<li>${role}</li>`).join('')
    : '<li>USER (default)</li>';

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

          .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }

          .info-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }

          p {
            color: #666666;
            line-height: 1.5;
          }

          ul {
            color: #666666;
            line-height: 1.8;
          }

          .button {
            display: block;
            margin: 20px auto;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            width: fit-content;
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
          <h1>Role Update Notification</h1>
          <p>
            ${userName ? `Hi ${userName},` : 'Hi there,'}
          </p>
          <div class="warning-box">
            <p style="margin: 0; color: #856404; font-weight: 600;">
              ⚠️ Important: Your role has been updated
            </p>
          </div>
          <p>
            We are writing to inform you that the role <strong>"${roleName}"</strong> has been removed from your account.
          </p>
          <p>
            This change was made by the system administrator as part of role management updates.
          </p>
          <div class="info-box">
            <p style="margin-top: 0; font-weight: 600; color: #333;">Your current roles:</p>
            <ul style="margin-bottom: 0;">
              ${remainingRolesList}
            </ul>
          </div>
          <p>
            If you have any questions or concerns about this change, please contact our support team.
          </p>
          <a href="${siteLink}" class="button">Access Your Account</a>
          <div class="footer">
            <p>
              This is an automated notification. Please do not reply to this email.
              <br>
              If you believe this change was made in error, please contact our administration team immediately.
            </p>
            <p>&copy; ${new Date().getFullYear()} GurukulamHub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

