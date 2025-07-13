export const privacy = `
	<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy - Link Bed Sides</title>
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

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        .privacy-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .shield-icon {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            position: relative;
            z-index: 1;
        }

        .hero-section h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .hero-section p {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }

        .effective-date {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            display: inline-block;
            margin-top: 1rem;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 2rem;
        }

        .table-of-contents {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid #667eea;
        }

        .table-of-contents h2 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }

        .toc-list {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.5rem;
        }

        .toc-list li {
            padding: 0.5rem 0;
        }

        .toc-list a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .toc-list a:hover {
            color: #5a67d8;
            text-decoration: underline;
        }

        .section {
            margin-bottom: 3rem;
            scroll-margin-top: 100px;
        }

        .section h2 {
            color: #2d3748;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
        }

        .section p {
            margin-bottom: 1rem;
            color: #4a5568;
            font-size: 1.05rem;
        }

        .info-list {
            list-style: none;
            margin: 1rem 0;
        }

        .info-list li {
            padding: 0.75rem 0;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .info-list li:last-child {
            border-bottom: none;
        }

        .info-list li::before {
            content: '✓';
            color: #48bb78;
            font-weight: bold;
            font-size: 1.1rem;
            margin-top: 0.1rem;
        }

        .highlight-box {
            background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
            border-left: 4px solid #38b2ac;
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .highlight-box h2 {
            color: #2d3748;
            margin-bottom: 1rem;
            border-bottom: none;
            font-size: 1.5rem;
        }

        .highlight-box .delete-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }

        .ordered-list {
            list-style: none;
            counter-reset: step-counter;
            margin: 1rem 0;
        }

        .ordered-list li {
            counter-increment: step-counter;
            padding: 1rem 0;
            position: relative;
            padding-left: 3rem;
        }

        .ordered-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 1rem;
            width: 2rem;
            height: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 1rem 0;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            text-decoration: none;
        }

        .contact-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-top: 2rem;
            text-align: center;
        }

        .contact-section h2 {
            color: white;
            margin-bottom: 1rem;
            border-bottom: none;
        }

        .contact-section a {
            color: #e2e8f0;
            font-weight: 600;
        }

        .contact-section a:hover {
            color: white;
        }

        .footer {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding: 2rem 0;
            text-align: center;
            color: #4a5568;
            margin-top: 2rem;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1rem;
        }

        .footer-links a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }

        .footer-links a:hover {
            text-decoration: underline;
        }

        .scroll-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0;
            transform: translateY(100px);
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .scroll-to-top.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .scroll-to-top:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .hero-section h1 {
                font-size: 2rem;
            }

            .hero-section p {
                font-size: 1rem;
            }

            .content {
                padding: 1.5rem;
            }

            .toc-list {
                grid-template-columns: 1fr;
            }

            .footer-links {
                flex-direction: column;
                gap: 1rem;
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
                <a href="/api/v1.1/auth/account-deletion">Account Deletion</a>
                <a href="/support">Support</a>
            </nav>
        </div>
    </header>

    <div class="container">
        <div class="privacy-card">
            <div class="hero-section">
                <div class="shield-icon">🛡️</div>
                <h1>Privacy Policy</h1>
                <p>Your privacy matters to us. Learn how we collect, use, and protect your personal information.</p>
                <div class="effective-date">Effective Date: March 7, 2025</div>
            </div>

            <div class="content">
                <div class="table-of-contents">
                    <h2>Quick Navigation</h2>
                    <ul class="toc-list">
                        <li><a href="#information-collect">Information We Collect</a></li>
                        <li><a href="#how-we-use">How We Use Your Information</a></li>
                        <li><a href="#data-security">Data Security</a></li>
                        <li><a href="#data-retention">Data Retention</a></li>
                        <li><a href="#account-deletion">Account Deletion</a></li>
                        <li><a href="#your-rights">Your Rights</a></li>
                        <li><a href="#policy-changes">Policy Changes</a></li>
                        <li><a href="#contact-us">Contact Us</a></li>
                    </ul>
                </div>

                <div class="section" id="information-collect">
                    <h2>
                        <div class="section-icon">📊</div>
                        Information We Collect
                    </h2>
                    <p>We collect information to provide you with the best possible healthcare coordination experience. Here's what we gather:</p>
                    <ul class="info-list">
                        <li>Personal information such as name and email address when you sign up for our services</li>
                        <li>Usage information, including your interactions with our website and services</li>
                        <li>Device information to ensure optimal app performance</li>
                        <li>Location data when necessary for appointment scheduling</li>
                    </ul>
                </div>

                <div class="section" id="how-we-use">
                    <h2>
                        <div class="section-icon">⚙️</div>
                        How We Use Your Information
                    </h2>
                    <p>Your information helps us deliver and improve our healthcare coordination services:</p>
                    <ul class="info-list">
                        <li>To provide and maintain our services</li>
                        <li>To improve and personalize your experience</li>
                        <li>To communicate with you regarding our services</li>
                        <li>To ensure the security and integrity of our platform</li>
                        <li>To comply with legal requirements and healthcare regulations</li>
                    </ul>
                </div>

                <div class="section" id="data-security">
                    <h2>
                        <div class="section-icon">🔒</div>
                        Data Security
                    </h2>
                    <p>We implement comprehensive security measures to protect your sensitive healthcare information:</p>
                    <ul class="info-list">
                        <li>End-to-end encryption for all data transmission</li>
                        <li>Secure servers with regular security updates</li>
                        <li>Multi-factor authentication for healthcare professionals</li>
                        <li>Regular security audits and compliance checks</li>
                        <li>HIPAA-compliant data handling procedures</li>
                    </ul>
                </div>

                <div class="section" id="data-retention">
                    <h2>
                        <div class="section-icon">🕐</div>
                        Data Retention
                    </h2>
                    <p>We retain your data only as long as necessary to provide our services and comply with legal requirements. You can request data deletion at any time as described in our account deletion process.</p>
                </div>

                <div class="highlight-box" id="account-deletion">
                    <div class="delete-icon">🗑️</div>
                    <h2>Account Deletion</h2>
                    <p>You have the right to request deletion of your Link Bed Sides account and associated personal data. Here's how:</p>
                    <ol class="ordered-list">
                        <li>Visit our Account Deletion Page using the link below</li>
                        <li>Enter the email address or phone number associated with your account</li>
                        <li>Provide a reason for deletion (optional but helpful)</li>
                        <li>Confirm your deletion request</li>
                    </ol>
                    <a href="/api/v1.1/auth/account-deletion" class="cta-button">Delete My Account</a>
                    <p><strong>What happens next:</strong></p>
                    <ul class="info-list">
                        <li>We verify your identity to ensure account security</li>
                        <li>Process the deletion within 7 business days</li>
                        <li>Send a confirmation email when deletion is complete</li>
                        <li>Permanently remove your personal data from our systems</li>
                    </ul>
                    <p><strong>Important:</strong> Certain information may be retained as required by law or for legitimate business purposes, such as fraud prevention and regulatory compliance.</p>
                </div>

                <div class="section" id="your-rights">
                    <h2>
                        <div class="section-icon">⚖️</div>
                        Your Rights
                    </h2>
                    <p>You have comprehensive rights regarding your personal data:</p>
                    <ul class="info-list">
                        <li>Access your personal data and download a copy</li>
                        <li>Request corrections to inaccurate or incomplete data</li>
                        <li>Request deletion of your account and personal data</li>
                        <li>Withdraw consent for data collection (may limit app functionality)</li>
                        <li>Object to processing of your personal data</li>
                        <li>Request data portability to another service</li>
                    </ul>
                </div>

                <div class="section" id="policy-changes">
                    <h2>
                        <div class="section-icon">📝</div>
                        Changes to This Privacy Policy
                    </h2>
                    <p>We may update our privacy policy from time to time to reflect changes in our practices, technology, or legal requirements. We will:</p>
                    <ul class="info-list">
                        <li>Post any changes on this page with a new effective date</li>
                        <li>Notify you via email of significant changes</li>
                        <li>Provide a summary of key changes when updates occur</li>
                        <li>Maintain previous versions for your reference</li>
                    </ul>
                </div>

                <div class="contact-section" id="contact-us">
                    <h2>Questions? We're Here to Help</h2>
                    <p>If you have any questions about this privacy policy or how we handle your data, please don't hesitate to contact us:</p>
                    <p><strong>Email:</strong> <a href="mailto:ianbalijawa16@gmail.com">ianbalijawa16@gmail.com</a></p>
                    <p><strong>Response Time:</strong> Within 24-48 hours</p>
                </div>
            </div>
        </div>
    </div>

    <footer class="footer">
        <div class="footer-links">
            <a href="/">Home</a>
            <a href="/api/v1.1/auth/account-deletion">Account Deletion</a>
            <a href="/support">Support</a>
            <a href="/terms">Terms of Service</a>
        </div>
        <p>&copy; 2025 Link Bed Sides. All rights reserved.</p>
    </footer>

    <button class="scroll-to-top" id="scrollToTop">↑</button>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll to top button
        const scrollToTopBtn = document.getElementById('scrollToTop');

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Highlight current section in navigation
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.toc-list a');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.style.color = '#667eea';
                if (link.getAttribute('href') === '#' + current) {
                    link.style.color = '#5a67d8';
                    link.style.fontWeight = '600';
                } else {
                    link.style.fontWeight = '500';
                }
            });
        });
    </script>
</body>
</html>
`;
