<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SohojSync</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #3d2d50 0%, #4a3a5e 100%); min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(rgb(61, 45, 80) 0%, rgb(0 0 0 / 22%) 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 60px; height: 60px; background: rgb(155 2 50 / 76%); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                                <svg width="32" height="32" viewBox="0 0 20 20" fill="white">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                                </svg>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to SohojSync</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Your Project Management Platform</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 600;">Hello {{ $user->name }}! 👋</h2>
                            
                            <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                Your account has been successfully created. You can now access the SohojSync platform using the credentials below:
                            </p>

                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom right, #f9fafb, #f3f4f6); border-radius: 12px; border: 2px solid #e5e7eb; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <strong style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0 16px;">
                                                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">{{ $user->email }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <strong style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Password</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <code style="background: #ffffff; padding: 10px 16px; border-radius: 8px; color: #dc2626; font-size: 18px; font-weight: 700; letter-spacing: 1px; border: 1px solid #fecaca; display: inline-block;">{{ $password }}</code>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                <strong style="color: #dc2626;">⚠️ Important:</strong> Please change your password after your first login for security purposes.
                            </p>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}" 
                                           style="display: inline-block; background: rgb(155 2 50 / 76%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(155, 2, 50, 0.3);">
                                            Login to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                                If you have any questions or need assistance, please don't hesitate to contact our support team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 600;">SohojSync</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © {{ date('Y') }} SohojSync. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
