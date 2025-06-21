export const html = (otp: string) => {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            line-height: 1.6;
            color: #334155;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: #e2e8f0;
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .otp-container {
            background-color: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 30px;
            margin: 30px 0;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        
        .otp-label {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 25px;
        }
        
        .expiry {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .expiry-text {
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
        }
        
        .security-note {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-text {
            color: #991b1b;
            font-size: 14px;
            font-weight: 500;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .company-name {
            font-weight: 600;
            color: #1e293b;
        }
        
        @media only screen and (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
            
            .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Verification</h1>
            <p>Complete your registration</p>
        </div>
        
        <div class="content">
            <p class="message">
                We received a request to verify your account. Use the code below to complete your verification.
            </p>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry">
                <div class="expiry-text">
                    ⏰ This code expires in 10 minutes
                </div>
            </div>
            
            <div class="security-note">
                <div class="security-text">
                    🔒 Never share this code with anyone. Our team will never ask for this code.
                </div>
            </div>
            
            <p class="message">
                If you didn't request this verification, please ignore this email or contact our support team.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                This email was sent by <span class="company-name">Link Bedside Nurses</span>
            </p>
            <p class="footer-text">
                Need help? Contact us at support@linkbedsides.com
            </p>
        </div>
    </div>
</body>
</html>
`;
};
