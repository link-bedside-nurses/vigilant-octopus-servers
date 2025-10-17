import envars from "../config/env-vars";

const APP_URL = envars.APP_URL;


// Modern notification templates
export const NOTIFICATION_TEMPLATES = {
	nurseAssignment: {
		subject: 'New Appointment Assignment - Action Required',
		text: 'You have been assigned to a new appointment. Please review the details and confirm your availability within 2 hours.',
		html: (
			appointment: {
				patient: { name: string; phone: string };
				date: string | number | Date;
				location: any;
				symptoms: string[];
				id: string;
			},
			nurse: { firstName: string; lastName: string }
		) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>New Appointment Assignment</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
						background: linear-gradient(135deg, #10b981 0%, #059669 100%);
						padding: 30px;
						text-align: center;
					}
					.header h1 {
						color: #ffffff;
						font-size: 24px;
						font-weight: 700;
						margin-bottom: 8px;
					}
					.header p {
						color: #d1fae5;
						font-size: 16px;
					}
					.content {
						padding: 40px 30px;
					}
					.greeting {
						font-size: 18px;
						color: #1e293b;
						margin-bottom: 20px;
						font-weight: 600;
					}
					.message {
						font-size: 16px;
						color: #475569;
						margin-bottom: 30px;
					}
					.appointment-card {
						background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
						border: 1px solid #0ea5e9;
						border-radius: 12px;
						padding: 25px;
						margin: 25px 0;
					}
					.appointment-title {
						color: #0c4a6e;
						font-size: 18px;
						font-weight: 700;
						margin-bottom: 20px;
						display: flex;
						align-items: center;
					}
					.detail-row {
						display: flex;
						padding: 12px 0;
						border-bottom: 1px solid #e2e8f0;
					}
					.detail-row:last-child {
						border-bottom: none;
					}
					.detail-label {
						font-weight: 600;
						color: #1e293b;
						min-width: 120px;
						display: flex;
						align-items: center;
					}
					.detail-value {
						color: #475569;
						flex: 1;
					}
					.symptoms-list {
						background-color: #fef3c7;
						border-left: 4px solid #f59e0b;
						padding: 15px 20px;
						border-radius: 0 8px 8px 0;
						margin: 20px 0;
					}
					.symptoms-title {
						color: #92400e;
						font-weight: 600;
						margin-bottom: 10px;
					}
					.symptoms-tags {
						display: flex;
						flex-wrap: wrap;
						gap: 8px;
					}
					.symptom-tag {
						background-color: #fed7aa;
						color: #9a3412;
						padding: 4px 12px;
						border-radius: 20px;
						font-size: 14px;
						font-weight: 500;
					}
					.action-section {
						background-color: #f1f5f9;
						border-radius: 12px;
						padding: 25px;
						margin: 30px 0;
						text-align: center;
					}
					.action-title {
						color: #1e293b;
						font-size: 18px;
						font-weight: 700;
						margin-bottom: 15px;
					}
					.action-text {
						color: #64748b;
						margin-bottom: 20px;
					}
					.cta-button {
						display: inline-block;
						background: linear-gradient(135deg, #10b981 0%, #059669 100%);
						color: #ffffff;
						padding: 15px 30px;
						text-decoration: none;
						border-radius: 8px;
						font-weight: 600;
						font-size: 16px;
						margin: 0 10px 10px 0;
					}
					.cta-secondary {
						display: inline-block;
						background-color: #ffffff;
						color: #10b981;
						border: 2px solid #10b981;
						padding: 13px 28px;
						text-decoration: none;
						border-radius: 8px;
						font-weight: 600;
						font-size: 16px;
						margin: 0 10px 10px 0;
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
						margin-bottom: 10px;
					}
					.company-name {
						font-weight: 600;
						color: #10b981;
					}
					@media only screen and (max-width: 600px) {
						.container { margin: 10px; }
						.header, .content { padding: 20px; }
						.cta-button, .cta-secondary { display: block; margin: 10px 0; }
						.detail-row { flex-direction: column; }
						.detail-label { margin-bottom: 5px; }
						.symptoms-tags { flex-direction: column; }
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🏥 New Assignment</h1>
						<p>You have a new patient appointment</p>
					</div>

					<div class="content">
						<div class="greeting">
							Hello ${nurse.firstName} ${nurse.lastName} 👋
						</div>

						<div class="message">
							You have been assigned to a new appointment. Please review the details below and confirm your availability.
						</div>

						<div class="appointment-card">
							<div class="appointment-title">
								📅 Appointment Details
							</div>

							<div class="detail-row">
								<div class="detail-label">👤 Patient:</div>
								<div class="detail-value">${appointment.patient.name} ${appointment.patient.phone}</div>
							</div>

							<div class="detail-row">
								<div class="detail-label">📅 Date:</div>
								<div class="detail-value">${new Date(appointment.date).toLocaleDateString('en-US', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}</div>
							</div>

							<div class="detail-row">
								<div class="detail-label">🕐 Time:</div>
								<div class="detail-value">${new Date(appointment.date).toLocaleTimeString('en-US', {
									hour: 'numeric',
									minute: '2-digit',
									hour12: true,
								})}</div>
							</div>

							<div class="detail-row">
								<div class="detail-label">📍 Location:</div>
								<div class="detail-value">${appointment.location || 'Patient Home'}</div>
							</div>
						</div>

						${
							appointment.symptoms && appointment.symptoms.length > 0
								? `
						<div class="symptoms-list">
							<div class="symptoms-title">🩺 Reported Symptoms</div>
							<div class="symptoms-tags">
								${appointment.symptoms.map((symptom: any) => `<span class="symptom-tag">${symptom}</span>`).join('')}
							</div>
						</div>
						`
								: ''
						}
					</div>

					<div class="footer">
						<p class="footer-text">
							This email was sent by <span class="company-name">Link Bed Sides</span>
						</p>
						<p class="footer-text">
							Need help? Contact us at support@linkbedsides.com
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	patientNotification: {
		subject: 'Great News! Your Nurse Has Been Assigned',
		text: 'A qualified nurse has been assigned to your appointment and will contact you shortly to confirm the visit details.',
		html: (
			appointment: {
				patient: { name: string };
				date: string | number | Date;
				location: any;
				id: string;
			},
			nurse: {
				firstName: string;
				lastName: string;
				specialization: any;
				experience: any;
				phone: string;
			}
		) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Nurse Assigned</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
						background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
						padding: 30px;
						text-align: center;
					}
					.header h1 {
						color: #ffffff;
						font-size: 24px;
						font-weight: 700;
						margin-bottom: 8px;
					}
					.header p {
						color: #dbeafe;
						font-size: 16px;
					}
					.content {
						padding: 40px 30px;
					}
					.greeting {
						font-size: 18px;
						color: #1e293b;
						margin-bottom: 20px;
						font-weight: 600;
					}
					.good-news {
						background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
						border: 1px solid #10b981;
						border-radius: 12px;
						padding: 25px;
						margin: 25px 0;
						text-align: center;
					}
					.good-news-title {
						color: #065f46;
						font-size: 20px;
						font-weight: 700;
						margin-bottom: 10px;
					}
					.good-news-text {
						color: #047857;
						font-size: 16px;
					}
					.nurse-card {
						background: linear-gradient(135deg, #fefbff 0%, #f3e8ff 100%);
						border: 1px solid #a855f7;
						border-radius: 12px;
						padding: 25px;
						margin: 25px 0;
					}
					.nurse-title {
						color: #581c87;
						font-size: 18px;
						font-weight: 700;
						margin-bottom: 20px;
						display: flex;
						align-items: center;
					}
					.nurse-info {
						display: flex;
						align-items: center;
						margin-bottom: 20px;
					}
					.nurse-avatar {
						width: 60px;
						height: 60px;
						border-radius: 50%;
						background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
						display: flex;
						align-items: center;
						justify-content: center;
						color: white;
						font-size: 24px;
						font-weight: bold;
						margin-right: 20px;
					}
					.nurse-details h3 {
						color: #581c87;
						font-size: 18px;
						margin-bottom: 5px;
					}
					.nurse-details p {
						color: #7c3aed;
						font-size: 14px;
					}
					.appointment-summary {
						background-color: #f1f5f9;
						border-radius: 12px;
						padding: 25px;
						margin: 25px 0;
					}
					.summary-title {
						color: #1e293b;
						font-size: 18px;
						font-weight: 700;
						margin-bottom: 20px;
					}
					.detail-row {
						display: flex;
						padding: 12px 0;
						border-bottom: 1px solid #e2e8f0;
					}
					.detail-row:last-child {
						border-bottom: none;
					}
					.detail-label {
						font-weight: 600;
						color: #1e293b;
						min-width: 100px;
					}
					.detail-value {
						color: #475569;
						flex: 1;
					}
					.next-steps {
						background-color: #fef3c7;
						border-left: 4px solid #f59e0b;
						padding: 20px;
						border-radius: 0 8px 8px 0;
						margin: 25px 0;
					}
					.next-steps-title {
						color: #92400e;
						font-weight: 700;
						margin-bottom: 15px;
						font-size: 16px;
					}
					.next-steps-list {
						color: #92400e;
						font-size: 14px;
					}
					.next-steps-list li {
						margin-bottom: 8px;
						padding-left: 10px;
					}
					.contact-section {
						text-align: center;
						margin: 30px 0;
					}
					.contact-button {
						display: inline-block;
						background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
						color: #ffffff;
						padding: 15px 30px;
						text-decoration: none;
						border-radius: 8px;
						font-weight: 600;
						font-size: 16px;
						margin: 10px;
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
						margin-bottom: 10px;
					}
					.company-name {
						font-weight: 600;
						color: #3b82f6;
					}
					@media only screen and (max-width: 600px) {
						.container { margin: 10px; }
						.header, .content { padding: 20px; }
						.nurse-info { flex-direction: column; text-align: center; }
						.nurse-avatar { margin-right: 0; margin-bottom: 15px; }
						.detail-row { flex-direction: column; }
						.detail-label { margin-bottom: 5px; }
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🎉 Nurse Assigned!</h1>
						<p>Your healthcare journey continues</p>
					</div>

					<div class="content">
						<div class="greeting">
							Hello ${appointment.patient.name} 👋
						</div>

						<div class="good-news">
							<div class="good-news-title">✨ Great News!</div>
							<div class="good-news-text">
								A qualified nurse has been assigned to your appointment and will provide excellent care.
							</div>
						</div>

						<div class="nurse-card">
							<div class="nurse-title">
								👩‍⚕️ Your Assigned Nurse
							</div>

							<div class="nurse-info">
								<div class="nurse-avatar">
									${nurse.firstName.charAt(0)}${nurse.lastName.charAt(0)}
								</div>
								<div class="nurse-details">
									<h3>${nurse.firstName} ${nurse.lastName}</h3>
									<p>Licensed Healthcare Professional</p>
									${nurse.specialization ? `<p>Specialization: ${nurse.specialization}</p>` : ''}
									${nurse.experience ? `<p>${nurse.experience} years of experience</p>` : ''}
								</div>
							</div>
						</div>

						<div class="appointment-summary">
							<div class="summary-title">📋 Appointment Summary</div>

							<div class="detail-row">
								<div class="detail-label">📅 Date:</div>
								<div class="detail-value">${new Date(appointment.date).toLocaleDateString('en-US', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}</div>
							</div>

							<div class="detail-row">
								<div class="detail-label">🕐 Time:</div>
								<div class="detail-value">${new Date(appointment.date).toLocaleTimeString('en-US', {
									hour: 'numeric',
									minute: '2-digit',
									hour12: true,
								})}</div>
							</div>

							<div class="detail-row">
								<div class="detail-label">📍 Location:</div>
								<div class="detail-value">${appointment.location || 'Your Home'}</div>
							</div>

							<div class="detail-row">
								<div class="detail-label">👩‍⚕️ Nurse:</div>
								<div class="detail-value">${nurse.firstName} ${nurse.lastName}</div>
							</div>
						</div>

						<div class="next-steps">
							<div class="next-steps-title">📞 What Happens Next?</div>
							<ul class="next-steps-list">
								<li>Your nurse will contact you within the next 2 hours</li>
								<li>They will confirm appointment details and address any questions</li>
								<li>You'll receive a reminder 24 hours before your appointment</li>
								<li>Prepare any questions or concerns you'd like to discuss</li>
							</ul>
						</div>

						<div class="contact-section">
							<a href="tel:${nurse.phone || '+1234567890'}" class="contact-button">
								📞 Contact Your Nurse
							</a>
							<a href="${APP_URL}/appointments/${appointment.id}" class="contact-button">
								📱 View Appointment
							</a>
						</div>
					</div>

					<div class="footer">
						<p class="footer-text">
							This email was sent by <span class="company-name">Link Bed Sides</span>
						</p>
						<p class="footer-text">
							Need help? Contact us at support@linkbedsides.com | Call: +256-XXX-XXXX
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	nurseVerification: {
		subject: 'Your Account Has Been Verified!',
		text: 'Congratulations! Your Link Bed Sides nurse account has been verified and is now active. You can now start receiving assignments.',
		html: (nurse: { firstName: string; lastName: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Account Verified</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; }
					.footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🎉 Account Verified!</h1>
					</div>
					<div class="content">
						<div class="greeting">Hello ${nurse.firstName} ${nurse.lastName},</div>
						<div class="message">
							Congratulations! Your Link Bed Sides nurse account has been <b>verified</b> and is now <b>active</b>.<br><br>
							You can now start receiving patient assignments and providing care.<br><br>
							Thank you for joining our team!
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <span class="company-name">Link Bed Sides</span></p>
						<p class="footer-text">Need help? Contact us at support@linkbedsides.com</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	nurseBan: {
		subject: 'Account Banned - Access Revoked',
		text: 'Your Link Bed Sides nurse account has been banned and access is now revoked. Please contact support for more information.',
		html: (nurse: { firstName: string; lastName: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Account Banned</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; }
					.footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🚫 Account Banned</h1>
					</div>
					<div class="content">
						<div class="greeting">Hello ${nurse.firstName} ${nurse.lastName},</div>
						<div class="message">
							Your Link Bed Sides nurse account has been <b>banned</b> and your access is now revoked.<br><br>
							If you believe this is a mistake, please contact support for more information.
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <span class="company-name">Link Bed Sides</span></p>
						<p class="footer-text">Need help? Contact us at support@linkbedsides.com</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	patientBan: {
		subject: 'Account Banned - Access Revoked',
		text: 'Your Link Bed Sides account has been banned and access is now revoked. Please contact support for more information.',
		html: (patient: { name: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Account Banned</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; }
					.footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🚫 Account Banned</h1>
					</div>
					<div class="content">
						<div class="greeting">Hello ${patient.name},</div>
						<div class="message">
							Your Link Bed Sides account has been <b>banned</b> and your access is now revoked.<br><br>
							If you believe this is a mistake, please contact support for more information.
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <span class="company-name">Link Bed Sides</span></p>
						<p class="footer-text">Need help? Contact us at support@linkbedsides.com</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	patientVerification: {
		subject: 'Your Account Has Been Verified!',
		text: 'Congratulations! Your Link Bed Sides account has been verified and is now active. You can now book appointments and access services.',
		html: (patient: { name: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Account Verified</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; }
					.footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🎉 Account Verified!</h1>
					</div>
					<div class="content">
						<div class="greeting">Hello ${patient.name},</div>
						<div class="message">
							Congratulations! Your Link Bed Sides account has been <b>verified</b> and is now <b>active</b>.<br><br>
							You can now book appointments and access our services.<br><br>
							Thank you for joining us!
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <span class="company-name">Link Bed Sides</span></p>
						<p class="footer-text">Need help? Contact us at support@linkbedsides.com</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	nurseWelcome: {
		subject: 'Welcome to Link Bed Sides! Your Account is Under Review',
		text: 'Thank you for registering as a nurse with Link Bed Sides! Your account has been created and is now pending verification by our team. We will notify you once your account is verified and you can start receiving assignments. If you have any questions, please contact us at support@linkbedsides.com.',
		html: (nurse: { firstName: string; lastName: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Welcome to Link Bed Sides!</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; }
					.status { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0; color: #92400e; }
					.footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>👋 Welcome, ${nurse.firstName} ${nurse.lastName}!</h1>
					</div>
					<div class="content">
						<div class="greeting">Thank you for joining Link Bed Sides!</div>
						<div class="message">
							Your nurse account has been created and is now <b>pending verification</b> by our team.<br><br>
							We review all new nurse registrations to ensure the highest quality of care for our patients.<br><br>
							<span class="status">What happens next?</span>
							<ul>
								<li>Our team will review your submitted information and documents.</li>
								<li>You will receive an email and SMS once your account is verified and active.</li>
								<li>If we need more information, we will contact you directly.</li>
							</ul>
							<br>
							If you have any questions, please contact us at <a href="mailto:support@linkbedsides.com">support@linkbedsides.com</a>.<br><br>
							Thank you for your patience and for choosing to work with us!
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <span class="company-name">Link Bed Sides</span></p>
						<p class="footer-text">Need help? Contact us at support@linkbedsides.com</p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	adminAccountActivated: {
		subject: 'Your Admin Account Has Been Activated!',
		text: 'Your administrator account for Link Bed Sides has been successfully verified and activated.',
		html: (admin: { name: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Admin Account Activated</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; margin: 0; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; margin: 0; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; line-height: 1.6; }
					.footer { background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; margin: 4px 0; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>✅ Admin Account Activated</h1>
					</div>
					<div class="content">
						<div class="greeting">Hello ${admin.name},</div>
						<div class="message">
							Your <strong>administrator account</strong> has been successfully <strong>verified</strong> and is now <strong>active</strong>.<br><br>
							You now have full access to manage users, view analytics, and oversee platform operations.<br><br>
							If you did not request this verification, please contact our support team immediately.
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <strong>Link Bed Sides Admin Portal</strong>.</p>
						<p class="footer-text">Need assistance? Contact us at <a href="mailto:support@linkbedsides.com">support@linkbedsides.com</a></p>
					</div>
				</div>
			</body>
			</html>
		`,
	},

	adminAccountDeactivated: {
		subject: 'Your Admin Account Has Been Deactivated',
		text: 'Your administrator account for Link Bed Sides has been deactivated. Please contact support if this was unexpected.',
		html: (admin: { name: string }) => `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Admin Account Deactivated</title>
				<style>
					body { font-family: 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #334155; margin: 0; }
					.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
					.header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px; text-align: center; }
					.header h1 { color: #fff; font-size: 24px; font-weight: 700; margin: 0; }
					.content { padding: 40px 30px; }
					.greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
					.message { font-size: 16px; color: #475569; margin-bottom: 30px; line-height: 1.6; }
					.footer { background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; }
					.footer-text { color: #64748b; font-size: 14px; margin: 4px 0; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>⚠️ Admin Account Deactivated</h1>
					</div>
					<div class="content">
						<div class="greeting">Hello ${admin.name},</div>
						<div class="message">
							We wanted to let you know that your <strong>administrator account</strong> has been <strong>deactivated</strong> and access to the Link Bed Sides Admin Portal is temporarily disabled.<br><br>
							This action may have been taken due to policy changes, security reasons, or by request from a system administrator.<br><br>
							If you believe this is a mistake or wish to appeal this action, please contact our support team as soon as possible.
						</div>
					</div>
					<div class="footer">
						<p class="footer-text">This email was sent by <strong>Link Bed Sides Admin Portal</strong>.</p>
						<p class="footer-text">Need assistance? Contact us at <a href="mailto:support@linkbedsides.com">support@linkbedsides.com</a></p>
					</div>
				</div>
			</body>
			</html>
		`,
	},
};

// SMS Notification Templates
const SMS_TEMPLATES = {
	nurseAssignment: {
		assignment: (
			appointment: {
				patient: { name: string };
				date: string | number | Date;
				location: any;
				id: string;
			},
			nurse: { firstName: string }
		) =>
			`🏥 NEW ASSIGNMENT\n\nHi ${nurse.firstName}, you've been assigned to:\n\n👤 Patient: ${appointment.patient.name}\n📅 ${new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n📍 ${appointment.location || 'Patient Home'}\n\n⏰ CONFIRM within 2 hours\n\nConfirm: ${APP_URL}/confirm/${appointment.id}\nDecline: ${APP_URL}/decline/${appointment.id}\n\n- Link Bed Sides`,

		reminder: (
			appointment: {
				patient: { name: string };
				date: string | number | Date;
				confirmBy: string | number | Date;
				id: string;
			},
			nurse: { firstName: string }
		) =>
			`⚠️ REMINDER\n\nHi ${nurse.firstName}, please confirm your assignment for ${appointment.patient.name} on ${new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.\n\n⏰ ${Math.floor((new Date(appointment.confirmBy).getTime() - new Date().getTime()) / (1000 * 60))} minutes left to confirm\n\nConfirm now: ${APP_URL}/confirm/${appointment.id}\n\n- Link Bed Sides`,

		confirmed: (
			appointment: {
				patient: { name: string; phone: string };
				date: string | number | Date;
				id: string;
			},
			nurse: { firstName: string }
		) =>
			`✅ CONFIRMED\n\nThank you ${nurse.firstName}! Your assignment is confirmed:\n\n👤 ${appointment.patient.name}\n📅 ${new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n\nPatient contact: ${appointment.patient.phone}\nView details: ${APP_URL}/appointments/${appointment.id}\n\n- Link Bed Sides`,

		dayBeforeReminder: (
			appointment: {
				patient: { name: string; phone: string };
				date: string | number | Date;
				location: any;
				id: string;
			},
			nurse: { firstName: string }
		) =>
			`📅 TOMORROW\n\nHi ${nurse.firstName}, reminder for your appointment:\n\n👤 ${appointment.patient.name}\n🕐 ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n📍 ${appointment.location || 'Patient Home'}\n\nPatient: ${appointment.patient.phone}\nDetails: ${APP_URL}/appointments/${appointment.id}\n\n- Link Bed Sides`,

		finalReminder: (
			appointment: {
				patient: { name: string; phone: string };
				date: string | number | Date;
				location: any;
			},
			nurse: { firstName: string }
		) =>
			`🔔 STARTING SOON\n\nHi ${nurse.firstName}, your appointment starts in 2 hours:\n\n👤 ${appointment.patient.name}\n🕐 ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n📍 ${appointment.location || 'Patient Home'}\n\nPatient: ${appointment.patient.phone}\n\n- Link Bed Sides`,
	},

	patientNotification: {
		nurseAssigned: (
			appointment: { patient: { name: string }; date: string | number | Date; id: string },
			nurse: { firstName: string; lastName: string }
		) =>
			`🎉 NURSE ASSIGNED\n\nHi ${appointment.patient.name}, great news!\n\n👩‍⚕️ ${nurse.firstName} ${nurse.lastName} has been assigned to your appointment\n📅 ${new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n\n📞 Your nurse will call you within 2 hours to confirm details.\n\nView appointment: ${APP_URL}/appointments/${appointment.id}\n\n- Link Bed Sides`,

		appointmentConfirmed: (
			appointment: { patient: { name: string }; date: string | number | Date },
			nurse: { firstName: string; lastName: string; phone: string }
		) =>
			`✅ APPOINTMENT CONFIRMED\n\nHi ${appointment.patient.name},\n\n👩‍⚕️ ${nurse.firstName} ${nurse.lastName} confirmed your appointment:\n📅 ${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n\nNurse contact: ${nurse.phone || 'Available in app'}\n\n- Link Bed Sides`,

		dayBeforeReminder: (
			appointment: { patient: { name: string }; date: string | number | Date; location: any },
			nurse: { firstName: string; lastName: string; phone: string }
		) =>
			`📅 TOMORROW\n\nHi ${appointment.patient.name}, reminder:\n\n👩‍⚕️ ${nurse.firstName} ${nurse.lastName} will visit you tomorrow\n🕐 ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n📍 ${appointment.location || 'Your Home'}\n\n📞 Nurse: ${nurse.phone || 'Contact via app'}\n\nPrepare any questions you have!\n\n- Link Bed Sides`,

		finalReminder: (
			appointment: { patient: { name: string }; date: string | number | Date },
			nurse: { firstName: string; lastName: string; phone: string }
		) =>
			`🔔 APPOINTMENT SOON\n\nHi ${appointment.patient.name},\n\n👩‍⚕️ ${nurse.firstName} ${nurse.lastName} will arrive in 2 hours\n🕐 ${new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n\nPlease be ready at your location.\n📞 Nurse: ${nurse.phone || 'Contact via app'}\n\n- Link Bed Sides`,

		nurseEnRoute: (
			appointment: { patient: { name: string }; estimatedArrival: any },
			nurse: { firstName: string; phone: string }
		) =>
			`🚗 ON THE WAY\n\nHi ${appointment.patient.name},\n\n👩‍⚕️ ${nurse.firstName} is heading to your location and will arrive in approximately ${appointment.estimatedArrival || '15-20'} minutes.\n\n📞 ${nurse.phone || 'Contact via app'}\n\n- Link Bed Sides`,

		appointmentCompleted: (
			appointment: { patient: { name: string }; id: string },
			nurse: { firstName: string; lastName: string }
		) =>
			`✅ VISIT COMPLETED\n\nHi ${appointment.patient.name},\n\nThank you for choosing Link Bed Sides! Your visit with ${nurse.firstName} ${nurse.lastName} is complete.\n\n📋 Visit summary and care notes are available in your app.\n\nRate your experience: ${APP_URL}/rate/${appointment.id}\n\n- Link Bed Sides`,
	},

	emergency: {
		nurseCancellation: (
			appointment: { patient: { name: string }; date: string | number | Date },
			reason: any
		) =>
			`⚠️ APPOINTMENT UPDATE\n\nHi ${appointment.patient.name},\n\nWe need to reassign your nurse for ${new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} due to ${reason || 'unforeseen circumstances'}.\n\nWe're finding a replacement and will update you within 30 minutes.\n\nCall us: ${envars.SUPPORT_PHONE || '+256-XXX-XXXX'}\n\n- Link Bed Sides`,

		systemMaintenance: () =>
			`🔧 MAINTENANCE NOTICE\n\nOur app will be under maintenance from 2:00 AM - 4:00 AM tonight.\n\nFor emergencies during this time, call: ${envars.EMERGENCY_PHONE || '+256-XXX-XXXX'}\n\nSorry for any inconvenience.\n\n- Link Bed Sides`,

		weatherAlert: (appointment: { patient: { name: string } }, nurse: { firstName: string }) =>
			`🌧️ WEATHER ALERT\n\nHi ${appointment.patient.name},\n\nDue to severe weather, your appointment with ${nurse.firstName} may be delayed.\n\n📞 Your nurse will call you with updates.\n\nFor urgent care, call: ${envars.EMERGENCY_PHONE || '+256-XXX-XXXX'}\n\n- Link Bed Sides`,
	},

	admin: {
		nurseWelcome: (nurse: { firstName: string }) =>
			`🎉 WELCOME TO LINK BED SIDES!\n\nHi ${nurse.firstName},\n\nYour nurse account is now active. You'll start receiving appointment assignments based on your availability.\n\n📱 Download our app: ${envars.APP_DOWNLOAD_URL}\n\nQuestions? Call: ${envars.SUPPORT_PHONE || '+256-XXX-XXXX'}\n\n- Link Bed Sides Team`,

		patientWelcome: (patient: { firstName: string }) =>
			`🏥 WELCOME TO LINK BED SIDES!\n\nHi ${patient.firstName},\n\nYour account is ready! You can now book home healthcare visits with qualified nurses.\n\n📱 Book your first appointment: ${APP_URL}/book\n\nNeed help? Call: ${envars.SUPPORT_PHONE || '+256-XXX-XXXX'}\n\n- Link Bed Sides Team`,

		paymentConfirmed: (
			appointment: { patient: { name: string }; date: string | number | Date; id: string },
			amount: any
		) =>
			`💳 PAYMENT CONFIRMED\n\nHi ${appointment.patient.name},\n\nWe received your payment of ${amount} for the appointment on ${new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.\n\nReceipt: ${APP_URL}/receipt/${appointment.id}\n\n- Link Bed Sides`,
	},

	nurseVerification: (nurse: { firstName: string }) =>
		`✅ Hi ${nurse.firstName}, your Link Bed Sides account is now VERIFIED and active! You can now receive assignments. Welcome aboard!`,

	nurseBan: (nurse: { firstName: string }) =>
		`🚫 Hi ${nurse.firstName}, your Link Bed Sides account has been BANNED. Access revoked. Contact support if you believe this is a mistake.`,

	patientBan: (patient: { name: string }) =>
		`🚫 Hi ${patient.name}, your Link Bed Sides account has been BANNED. Access revoked. Contact support if you believe this is a mistake.`,

	patientVerification: (patient: { name: string }) =>
		`✅ Hi ${patient.name}, your Link Bed Sides account is now VERIFIED and active! You can now book appointments. Welcome!`,
};

// Helper function to get character count
const getCharacterCount = (template: string | any[]) => {
	return template.length;
};

// Helper function to validate SMS length (160 chars for single SMS)
const validateSMSLength = (message: string | any[]) => {
	if (message.length <= 160) {
		return { isValid: true, segments: 1, length: message.length };
	} else if (message.length <= 306) {
		return { isValid: true, segments: 2, length: message.length };
	} else if (message.length <= 459) {
		return { isValid: true, segments: 3, length: message.length };
	} else {
		return { isValid: false, segments: Math.ceil(message.length / 153), length: message.length };
	}
};

// Export templates
export { getCharacterCount, SMS_TEMPLATES, validateSMSLength };
