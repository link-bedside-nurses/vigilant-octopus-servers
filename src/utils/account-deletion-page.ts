export const accountDeletionPage = `
    <!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Deletion - Link Bed Sides</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #2d3748;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: #667eea;
            text-decoration: none;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
        }

        .nav-links a {
            text-decoration: none;
            color: #4a5568;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: #667eea;
        }

        .main-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }

        .deletion-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            width: 100%;
            max-width: 600px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-header {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            position: relative;
        }

        .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .card-header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }

        .card-header p {
            opacity: 0.9;
            font-size: 1.1rem;
            position: relative;
            z-index: 1;
        }

        .warning-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 1.5rem;
        }

        .card-body {
            padding: 2rem;
        }

        .auth-info {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid #fdcb6e;
        }

        .auth-info h3 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .auth-list {
            list-style: none;
            space-y: 0.5rem;
        }

        .auth-list li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #4a5568;
            margin-bottom: 0.5rem;
        }

        .auth-list li::before {
            content: '👤';
            font-size: 0.9rem;
        }

        .warning-box {
            background: linear-gradient(135deg, #fab1a0 0%, #e17055 100%);
            color: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid #e17055;
        }

        .warning-box h3 {
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .warning-list {
            list-style: none;
        }

        .warning-list li {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .warning-list li::before {
            content: '⚠️';
            font-size: 0.9rem;
            margin-top: 0.1rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2d3748;
        }

        .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: white;
        }

        .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
            resize: vertical;
            min-height: 100px;
            font-family: inherit;
        }

        .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 2rem;
        }

        .checkbox-input {
            width: 18px;
            height: 18px;
            margin-top: 0.2rem;
            accent-color: #667eea;
        }

        .checkbox-label {
            color: #4a5568;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(238, 90, 36, 0.3);
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .loading-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 300px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .message {
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            display: none;
        }

        .success-message {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
        }

        .error-message {
            background: linear-gradient(135deg, #e17055 0%, #d63031 100%);
            color: white;
        }

        .contact-section {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-top: 2rem;
        }

        .contact-section h3 {
            margin-bottom: 1rem;
        }

        .contact-section a {
            color: #ddd6fe;
            text-decoration: none;
        }

        .contact-section a:hover {
            color: white;
            text-decoration: underline;
        }

        .footer-links {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
        }

        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 1rem;
            font-weight: 500;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        .footer {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding: 1rem 0;
            text-align: center;
            color: #4a5568;
        }

        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .card-header h1 {
                font-size: 1.5rem;
            }

            .card-body {
                padding: 1.5rem;
            }

            .main-container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="/" class="logo">Link Bed Sides</a>
            <nav class="nav-links">
                <a href="/">Home</a>
                <a href="/privacy">Privacy</a>
                <a href="/support">Support</a>
            </nav>
        </div>
    </header>

    <div class="main-container">
        <div class="deletion-card">
            <div class="card-header">
                <div class="warning-icon">⚠️</div>
                <h1>Delete Account</h1>
                <p>This action cannot be undone</p>
            </div>

            <div class="card-body">
                <div class="auth-info">
                    <h3>Authentication Information</h3>
                    <ul class="auth-list">
                        <li><strong>Patients:</strong> Sign in with phone number and password</li>
                        <li><strong>Nurses:</strong> Sign in with email address and password</li>
                        <li><strong>Admins:</strong> Sign in with email address and password</li>
                    </ul>
                </div>

                <div class="warning-box">
                    <h3>What happens when you delete your account:</h3>
                    <ul class="warning-list">
                        <li>All personal information is permanently removed</li>
                        <li>Active appointments will be canceled</li>
                        <li>You cannot access the app with this account</li>
                        <li>Account deletion completes within 7 days</li>
                    </ul>
                </div>

                <form id="deletionForm">
                    <div class="form-group">
                        <label class="form-label" for="email">Email Address (if you have one)</label>
                        <input type="email" id="email" name="email" class="form-input" placeholder="Enter your email address" />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="phone">Phone Number (if you have one)</label>
                        <input type="tel" id="phone" name="phone" class="form-input" placeholder="Enter your phone number" />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="reason">Why are you leaving? (optional)</label>
                        <textarea id="reason" name="reason" class="form-input form-textarea" placeholder="Help us improve by sharing your feedback..."></textarea>
                    </div>

                    <div class="checkbox-group">
                        <input type="checkbox" id="confirmation" class="checkbox-input" required />
                        <label class="checkbox-label" for="confirmation">
                            I understand this action is permanent and cannot be undone
                        </label>
                    </div>

                    <button type="submit" class="submit-btn" id="submitBtn">
                        Delete My Account
                    </button>
                </form>

                <div id="successMessage" class="message success-message">
                    <h3>Request Submitted Successfully</h3>
                    <p>Your account deletion request has been received. Your account will be deleted within 7 days.</p>
                    <p>You can cancel this request by logging into your account within the next 7 days.</p>
                </div>

                <div id="errorMessage" class="message error-message">
                    <h3>Request Failed</h3>
                    <p id="errorText">We couldn't process your request. Please check your details and try again.</p>
                </div>

                <div class="contact-section">
                    <h3>Need Help?</h3>
                    <p>Contact our support team if you have questions:</p>
                    <p><strong>Email:</strong> <a href="mailto:ianbalijawa16@gmail.com">ianbalijawa16@gmail.com</a></p>
                    <p><strong>Response Time:</strong> Within 24-48 hours</p>
                </div>

                <div class="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/">Back to Home</a>
                </div>
            </div>
        </div>
    </div>

    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-content">
            <div class="spinner"></div>
            <p>Processing your request...</p>
        </div>
    </div>

    <footer class="footer">
        <p>&copy; 2025 Link Bed Sides. All rights reserved.</p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('deletionForm');
            const submitBtn = document.getElementById('submitBtn');
            const loadingOverlay = document.getElementById('loadingOverlay');
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

                // Show loading
                setLoading(true);

                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // For demo purposes, simulate success
                    const mockResponse = {
                        ok: true,
                        json: async () => ({ success: true })
                    };

                    if (mockResponse.ok) {
                        showSuccess();
                        form.reset();
                    } else {
                        showError('Failed to submit deletion request. Please try again.');
                    }
                } catch (error) {
                    showError('Network error. Please check your connection and try again.');
                } finally {
                    setLoading(false);
                }
            });

            function setLoading(isLoading) {
                loadingOverlay.style.display = isLoading ? 'flex' : 'none';
                submitBtn.disabled = isLoading;
                hideMessages();
            }

            function showSuccess() {
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                form.style.display = 'none';
                successMessage.scrollIntoView({ behavior: 'smooth' });
            }

            function showError(message) {
                errorText.textContent = message;
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                errorMessage.scrollIntoView({ behavior: 'smooth' });
            }

            function hideMessages() {
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
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

            // Form validation feedback
            const inputs = document.querySelectorAll('.form-input');
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    if (this.hasAttribute('required') && !this.value.trim()) {
                        this.style.borderColor = '#e17055';
                    } else {
                        this.style.borderColor = '#e2e8f0';
                    }
                });
            });
        });
    </script>
</body>
</html>
`;
