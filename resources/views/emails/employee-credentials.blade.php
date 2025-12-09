<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: rgb(61, 45, 80);
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: rgb(155, 2, 50, 0.76);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
        }
        .logo svg {
            width: 35px;
            height: 35px;
            fill: white;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #333;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .content p {
            color: #555;
            margin-bottom: 15px;
        }
        .credentials-box {
            background-color: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .credential-row {
            display: flex;
            margin-bottom: 15px;
            align-items: center;
        }
        .credential-row:last-child {
            margin-bottom: 0;
        }
        .credential-label {
            font-weight: 600;
            color: #333;
            min-width: 100px;
        }
        .credential-value {
            color: #555;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            flex: 1;
        }
        .password-value {
            color: #dc3545;
            font-weight: 600;
            border: 2px solid #dc3545;
        }
        .role-badge {
            display: inline-block;
            padding: 4px 12px;
            background: rgb(61, 45, 80);
            color: white;
            border-radius: 4px;
            font-size: 14px;
            text-transform: capitalize;
        }
        .btn {
            display: inline-block;
            padding: 14px 30px;
            background: rgb(155, 2, 50, 0.76);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning p {
            margin: 0;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <table class="container" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="header">
                <div class="logo">
                    <svg viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                </div>
                <h1>Welcome to SohojSync</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <h2>Hello, {{ $user->name }}!</h2>
                <p>Welcome to the team! Your employee account has been created successfully.</p>
                <p>Your role: <span class="role-badge">{{ str_replace('_', ' ', $user->role) }}</span></p>
                
                <div class="credentials-box">
                    <div class="credential-row">
                        <span class="credential-label">Email:</span>
                        <span class="credential-value">{{ $user->email }}</span>
                    </div>
                    <div class="credential-row">
                        <span class="credential-label">Password:</span>
                        <span class="credential-value password-value">{{ $password }}</span>
                    </div>
                </div>

                <div class="warning">
                    <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                </div>

                <center>
                    <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/login" class="btn">
                        Login to Your Account
                    </a>
                </center>

                <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                    If you have any questions or need assistance, please contact your administrator.
                </p>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <p>&copy; {{ date('Y') }} SohojSync. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
