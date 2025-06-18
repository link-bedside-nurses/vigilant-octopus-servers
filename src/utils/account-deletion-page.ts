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

        input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }

        textarea {
            resize: vertical;
            min-height: 80px;
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
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #c0392b;
        }

        button:disabled {
            background-color: #95a5a6;
            cursor: not-allowed;
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

        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #e74c3c;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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

        .contact-info {
            background-color: #e8f4fd;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-top: 20px;
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
                <p><strong>Important Information:</strong></p>
                <ul>
                    <li>This action cannot be undone once processed</li>
                    <li>All your personal information will be permanently removed</li>
                    <li>Your active appointments will be canceled</li>
                    <li>You will no longer be able to access the app with this account</li>
                    <li>Account deletion typically completes within 7 days of your request</li>
                </ul>
            </div>

            <form id="deletionForm">
                <div class="form-group">
                    <label for="email">Email Address (if you have one)</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email address" />
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number (if you have one)</label>
                    <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" />
                </div>

                <div class="form-group">
                    <label for="reason">Reason for Deletion (optional)</label>
                    <textarea id="reason" name="reason" placeholder="Please let us know why you're leaving..."></textarea>
                </div>

                <div class="form-group">
                    <label for="confirmation">
                        <input type="checkbox" id="confirmation" required />
                        I understand that this action is permanent and cannot be undone
                    </label>
                </div>

                <button type="submit" id="submitBtn">Request Account Deletion</button>
            </form>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Processing your request...</p>
            </div>

            <div id="successMessage" class="success-message">
                <h3>Request Submitted Successfully</h3>
                <p>Your account deletion request has been received. Your account will be deleted within 7 days.</p>
                <p>If you change your mind, you can cancel this request by logging into your account within the next 7 days.</p>
            </div>

            <div id="errorMessage" class="error-message">
                <h3>Request Failed</h3>
                <p id="errorText">We couldn't process your request. Please make sure you've entered the correct email address or phone number.</p>
            </div>
        </div>

        <div class="contact-info">
            <h3>Need Help?</h3>
            <p>If you have any questions or need assistance, please contact our support team:</p>
            <p><strong>Email:</strong> <a href="mailto:ianbalijawa16@gmail.com">ianbalijawa16@gmail.com</a></p>
            <p><strong>Response Time:</strong> Within 24-48 hours</p>
        </div>

        <p style="text-align: center; margin-top: 30px;">
            <a href="/privacy">Privacy Policy</a> | 
            <a href="/">Back to Home</a>
        </p>
    </div>

    <footer>
        <p>&copy; 2025 Link Bed Sides. All rights reserved.</p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('deletionForm');
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const successMessage = document.getElementById('successMessage');
            const errorMessage = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const email = document.getElementById('email').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const reason = document.getElementById('reason').value.trim();
                const confirmation = document.getElementById('confirmation').checked;

                // Validate form
                if (!confirmation) {
                    showError('Please confirm that you understand this action is permanent.');
                    return;
                }

                if (!email && !phone) {
                    showError('Please provide either an email address or phone number.');
                    return;
                }

                // Show loading state
                setLoading(true);

                try {
                    const response = await fetch('/account-deletion/request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email || undefined,
                            phone: phone || undefined,
                            reason: reason || undefined,
                            confirmation: true
                        })
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        showSuccess();
                        form.reset();
                    } else {
                        showError(result.message || 'Failed to submit deletion request. Please try again.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showError('Network error. Please check your connection and try again.');
                } finally {
                    setLoading(false);
                }
            });

            function setLoading(isLoading) {
                submitBtn.disabled = isLoading;
                loading.style.display = isLoading ? 'block' : 'none';
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
            }

            function showSuccess() {
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                form.style.display = 'none';
            }

            function showError(message) {
                errorText.textContent = message;
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }

            // Phone number formatting
            const phoneInput = document.getElementById('phone');
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\D/g, '');
                if (value.length > 0) {
                    if (value.startsWith('256')) {
                        value = value.substring(3);
                    }
                    if (value.length > 0 && !value.startsWith('0')) {
                        value = '0' + value;
                    }
                }
                e.target.value = value;
            });
        });
    </script>
</body>
</html>
`;
