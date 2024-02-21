export const html = ( otp: string ) => {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
        }
        .btn:hover {
            background-color: #0056b3;
        }

		p,h2{
			text-align:center;
		}
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://linkbedsides.vercel.app/logo.png" alt="Company Logo" width="150">
        </div>
        <h2>Veriry Your Email</h2>
        <p>Please use the following OTP (One-Time Password) to verify your email:</p>
        <div class="otp-code">${otp}</div>
    </div>
</body>
</html>
`
}
