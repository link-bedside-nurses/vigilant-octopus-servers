export const accountDeletionPage = `
    <!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Deletion - Link Bed Sides</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: #f7f8fa;
            color: #14182c;
        }

        header {
            background-color: #14182c;
            color: white;
            padding: 20px;
            text-align: center;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            flex: 1;
        }

        h1 {
            margin-top: 0;
            margin-bottom: 20px;
            color: #14182c;
            text-align: center;
        }

        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }

        button {
            background-color: #e74c3c;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 12px 20px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }

        button:hover {
            background-color: #c0392b;
        }

        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #ffa500;
            padding: 15px;
            margin-bottom: 20px;
        }

        .success-message, .error-message {
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
            display: none;
        }

        .success-message {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        footer {
            background-color: #14182c;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: auto;
        }

        a {
            color: #007bff;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>Link Bed Sides</h1>
    </header>

    <div class="container">
        <div class="card">
            <h1>Account Deletion Request</h1>

            <div class="info-box">
                <p>Please note that this action cannot be undone. When you delete your account:</p>
                <ul>
                    <li>All your personal information will be permanently removed</li>
                    <li>Your active appointments will be canceled</li>
                    <li>You will no longer be able to access the app with this account</li>
                </ul>
                <p>Account deletion typically completes within 7 days of your request.</p>
            </div>

            <form id="deletionForm">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="Enter your email address" />
                </div>

                <div class="form-group">
                    <label for="confirmation">
                        <input type="checkbox" id="confirmation" required />
                        I understand that this action is permanent and cannot be undone
                    </label>
                </div>

                <button type="submit">Request Account Deletion</button>
            </form>

            <div id="successMessage" class="success-message">
                Your account deletion request has been received. Your account will be deleted within 7 days.
            </div>

            <div id="errorMessage" class="error-message">
                We couldn't process your request. Please make sure you've entered the correct email address.
            </div>
        </div>

        <p>For further assistance, please contact our support at <a href="mailto:ianbalijawa16@gmail.com">ianbalijawa16@gmail.com</a></p>
    </div>

    <footer>
        <p>&copy; 2025 Link Bed Sides. All rights reserved.</p>
        <p><a href="/privacy" style="color: white; text-decoration: underline;">Privacy Policy</a></p>
    </footer>

   <script src="http://localhost:8000/static/script.js"></script>
</body>
</html>
`;
