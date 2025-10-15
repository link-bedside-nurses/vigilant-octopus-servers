import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { db } from '../database';
import { ACCOUNT } from '../interfaces';
import {
	AdminPasswordResetRequestSchema,
	AdminPasswordResetSchema,
	AdminSetPasswordSchema,
	AdminSigninSchema,
	AdminSignupSchema,
	PatientOTPVerificationSchema,
	PatientPhoneAuthSchema,
	PatientSetNameSchema,
} from '../interfaces/dtos';
import authenticate from '../middlewares/authentication';
import { adminTokenService } from '../services/admin-token.service';
import { messagingService } from '../services/messaging';
import { createAccessToken } from '../services/token';
import { sendNormalized } from '../utils/http-response';
import { Password } from '../utils/password';

const router = Router();

// ============================================================================
// PATIENT AUTHENTICATION ROUTES
// ============================================================================

// POST /auth/patient/signin - initiate patient signin with phone
router.post('/patient/signin', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = PatientPhoneAuthSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone } = result.data;

		let patient = await db.patients.findOne({ phone });

		if (!patient) {
			patient = await db.patients.create({
				phone,
			});
		}

		const otpResult = await messagingService.sendOTPViaSMS(phone);

		if (!otpResult.success) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send OTP. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				message: 'OTP sent to your phone number',
				user: patient,
				expiresAt: otpResult.expiresAt,
			},
			'Check your phone for OTP'
		);
	} catch (error) {
		console.error('Error in patient signin:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to send OTP. Please try again.'
		);
	}
});

// POST /auth/patient/verify-otp
router.post('/patient/verify-otp', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = PatientOTPVerificationSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone, otp } = result.data;

		const isValidOTP = await messagingService.verifyOTP(phone, otp);

		if (!isValidOTP) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		let patient = await db.patients.findOne({ phone });

		if (patient) {
			patient.isPhoneVerified = true;
			patient = await patient.save();

			await messagingService.expireOTP(phone);

			return sendNormalized(res, StatusCodes.OK, { user: patient }, 'Phone verified');
		} else {
			patient = await db.patients.create({
				phone,
				isPhoneVerified: true,
			});

			await messagingService.expireOTP(phone);

			return sendNormalized(res, StatusCodes.CREATED, { user: patient }, 'Phone verified');
		}
	} catch (error) {
		console.error('Error in patient OTP verification:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
});

// POST /auth/patient/set-name
router.post('/patient/set-name', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = PatientSetNameSchema.safeParse(req.body);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}
		const { phone, name } = result.data;
		const patient = await db.patients.findOne({ phone });
		if (!patient) {
			return sendNormalized(
				res,
				StatusCodes.NOT_FOUND,
				null,
				'Patient not found. Please verify your phone first.'
			);
		}
		if (!patient.isPhoneVerified) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Phone not verified. Please verify your phone first.'
			);
		}
		patient.name = name;
		await patient.save();
		const accessToken = createAccessToken(patient as unknown as mongoose.Document & ACCOUNT);
		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: patient, accessToken },
			'Account created and signed in successfully.'
		);
	} catch (error) {
		console.error('Error in patient set-name:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to set name. Please try again.'
		);
	}
});

// ============================================================================
// ADMIN AUTHENTICATION ROUTES
// ============================================================================

// POST /auth/admin/signup - Register new admin (not super admin)
router.post('/admin/signup', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminSignupSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, firstName, lastName } = result.data;

		// Check if email is already in use
		const existingAdmin = await db.admins.findOne({ email });
		if (existingAdmin) {
			return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Email already in use');
		}

		// Create admin without password initially
		const admin = await db.admins.create({
			email,
			firstName,
			lastName,
			isEmailVerified: false,
			isActive: false,
			isSuperAdmin: false,
			isPasswordSet: false,
		});

		// Generate password setup token (expires in 5 minutes)
		const { token, expiresAt } = await adminTokenService.createPasswordSetupToken(email, 300);

		// Send password setup email
		const emailResult = await messagingService.sendPasswordSetupEmail(email, token, expiresAt);

		if (!emailResult.success) {
			// Rollback - delete the admin if email fails
			await db.admins.findByIdAndDelete(admin.id);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send setup email. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.CREATED,
			{
				user: {
					id: admin.id,
					email: admin.email,
					firstName: admin.firstName,
					lastName: admin.lastName,
					isActive: admin.isActive,
					isPasswordSet: admin.isPasswordSet,
				},
				expiresAt,
			},
			'Admin account created. Please check your email to set up your password.'
		);
	} catch (error) {
		console.error('Error in admin signup:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'An error occurred during signup'
		);
	}
});

// POST /auth/admin/set-password - Set password using token from email
router.post('/admin/set-password', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminSetPasswordSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { token, password } = result.data;

		// Verify token and get email
		const email = await adminTokenService.verifyPasswordSetupToken(token);

		if (!email) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired token. Please request a new password setup link.'
			);
		}

		// Find admin
		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin account not found');
		}

		// Check if password is already set
		if (admin.isPasswordSet) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Password already set. Please use the signin flow.'
			);
		}

		// Hash and set password
		const hash = await Password.hash(password);
		admin.password = hash;
		admin.isPasswordSet = true;
		admin.isEmailVerified = true;
		await admin.save();

		// Invalidate the token
		await adminTokenService.invalidatePasswordSetupToken(token);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				user: {
					id: admin.id,
					email: admin.email,
					firstName: admin.firstName,
					lastName: admin.lastName,
					isActive: admin.isActive,
					isPasswordSet: admin.isPasswordSet,
				},
			},
			'Password set successfully. Please wait for super admin to activate your account.'
		);
	} catch (error) {
		console.error('Error in admin set-password:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to set password. Please try again.'
		);
	}
});

// POST /auth/admin/resend-setup-link - Resend password setup link
router.post(
	'/admin/resend-setup-link',
	async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const { email } = req.body;

			if (!email) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Email is required');
			}

			const admin = await db.admins.findOne({ email });

			if (!admin) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin account not found');
			}

			if (admin.isPasswordSet) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Password already set. Please use the signin flow.'
				);
			}

			// Generate new token
			const { token, expiresAt } = await adminTokenService.createPasswordSetupToken(email, 300);

			// Send email
			const emailResult = await messagingService.sendPasswordSetupEmail(email, token, expiresAt);

			if (!emailResult.success) {
				return sendNormalized(
					res,
					StatusCodes.INTERNAL_SERVER_ERROR,
					null,
					'Failed to send setup email. Please try again.'
				);
			}

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ expiresAt },
				'Password setup link sent to your email'
			);
		} catch (error) {
			console.error('Error in resend-setup-link:', error);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to resend setup link. Please try again.'
			);
		}
	}
);

// POST /auth/admin/signin
router.post('/admin/signin', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminSigninSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, password } = result.data;

		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return sendNormalized(res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials');
		}

		// Check if password is set
		if (!admin.isPasswordSet || !admin.password) {
			return sendNormalized(
				res,
				StatusCodes.UNAUTHORIZED,
				null,
				'Please complete your account setup first. Check your email for setup instructions.'
			);
		}

		// Check if email is verified
		if (!admin.isEmailVerified) {
			return sendNormalized(
				res,
				StatusCodes.UNAUTHORIZED,
				null,
				'Email not verified. Please complete account setup.'
			);
		}

		// Check if account is active
		if (!admin.isActive && !admin.isSuperAdmin) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Your account is pending activation by a super administrator. Please wait for approval.'
			);
		}

		// Verify password
		const match = await Password.verify(admin.password, password);

		if (!match) {
			return sendNormalized(res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials');
		}

		const accessToken = createAccessToken(admin as unknown as mongoose.Document & ACCOUNT);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				user: {
					id: admin.id,
					email: admin.email,
					firstName: admin.firstName,
					lastName: admin.lastName,
					isActive: admin.isActive,
					isSuperAdmin: admin.isSuperAdmin,
					isEmailVerified: admin.isEmailVerified,
					markedForDeletion: admin.markedForDeletion,
					deletionConfirmed: admin.deletionConfirmed,
					createdAt: admin.get('createdAt')?.toISOString?.() ?? null,
					updatedAt: admin.get('updatedAt')?.toISOString?.() ?? null,
				},
				accessToken,
			},
			'Signed in successfully'
		);
	} catch (error) {
		console.error('Error in admin signin:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'An error occurred during signin'
		);
	}
});

// POST /auth/admin/forgot-password
router.post('/admin/forgot-password', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminPasswordResetRequestSchema.safeParse(req.body);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email } = result.data;
		const admin = await db.admins.findOne({ email });

		if (!admin) {
			// Don't reveal that the account doesn't exist for security
			return sendNormalized(
				res,
				StatusCodes.OK,
				{ expiresAt: new Date(Date.now() + 300000) },
				'If an account exists with this email, a password reset link has been sent.'
			);
		}

		if (!admin.isPasswordSet) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Please complete your account setup first. Check your email for setup instructions.'
			);
		}

		const otpResult = await messagingService.sendOTPViaEmail(email, 300);

		if (!otpResult.success) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send reset OTP. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ expiresAt: otpResult.expiresAt },
			'Password reset OTP sent to your email'
		);
	} catch (error) {
		console.error('Error in admin forgot-password:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to initiate password reset. Please try again.'
		);
	}
});

// POST /auth/admin/reset-password - submit OTP and new password
router.post('/admin/reset-password', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminPasswordResetSchema.safeParse(req.body);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, otp, newPassword } = result.data;
		const isValidOTP = await messagingService.verifyOTP(email, otp);

		if (!isValidOTP) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin account not found');
		}

		const hash = await Password.hash(newPassword);
		admin.password = hash;
		await admin.save();
		await messagingService.expireOTP(email);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				user: {
					id: admin.id,
					email: admin.email,
					firstName: admin.firstName,
					lastName: admin.lastName,
					isActive: admin.isActive,
					isSuperAdmin: admin.isSuperAdmin,
					isEmailVerified: admin.isEmailVerified,
				},
			},
			'Password reset successful. You can now sign in.'
		);
	} catch (error) {
		console.error('Error in admin reset-password:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to reset password. Please try again.'
		);
	}
});

// ============================================================================
// SUPER ADMIN ROUTES (Protected)
// ============================================================================

// GET /auth/admin/pending - Get all pending admins (super admin only)
router.get(
	'/admin/pending',
	authenticate,
	async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const requestingAdmin = req.account;

			if (requestingAdmin?.type !== 'admin') {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Admin access required');
			}

			const admin = await db.admins.findById(requestingAdmin.id);

			if (!admin?.isSuperAdmin) {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Super admin access required');
			}

			// Get all admins who have set password but are not active
			const pendingAdmins = await db.admins
				.find({
					isPasswordSet: true,
					isActive: false,
					isSuperAdmin: false,
				})
				.select('-password')
				.sort({ createdAt: -1 });

			return sendNormalized(
				res,
				StatusCodes.OK,
				pendingAdmins,
				'Pending admins retrieved successfully'
			);
		} catch (error) {
			console.error('Error in get pending admins:', error);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to retrieve pending admins'
			);
		}
	}
);

// POST /auth/admin/:id/activate - Activate admin account (super admin only)
router.post(
	'/admin/:id/activate',
	authenticate,
	async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const requestingAdmin = req.account;

			if (requestingAdmin?.type !== 'admin') {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Admin access required');
			}

			const superAdmin = await db.admins.findById(requestingAdmin.id);

			if (!superAdmin?.isSuperAdmin) {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Super admin access required');
			}

			const adminToActivate = await db.admins.findById(req.params.id);

			if (!adminToActivate) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin not found');
			}

			if (adminToActivate.isSuperAdmin) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Cannot modify super admin status'
				);
			}

			if (adminToActivate.isActive) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Admin is already activated');
			}

			if (!adminToActivate.isPasswordSet) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Admin must complete password setup first'
				);
			}

			// Activate the admin
			adminToActivate.isActive = true;
			await adminToActivate.save();

			// Send activation email
			const fullName = [adminToActivate.firstName, adminToActivate.lastName]
				.filter(Boolean)
				.join(' ');
			await messagingService.sendAccountActivationEmail(adminToActivate.email, fullName);

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					id: adminToActivate.id,
					email: adminToActivate.email,
					firstName: adminToActivate.firstName,
					lastName: adminToActivate.lastName,
					isActive: adminToActivate.isActive,
				},
				'Admin account activated successfully'
			);
		} catch (error) {
			console.error('Error in activate admin:', error);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to activate admin account'
			);
		}
	}
);

// POST /auth/admin/:id/deactivate - Deactivate admin account (super admin only)
router.post(
	'/admin/:id/deactivate',
	authenticate,
	async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const requestingAdmin = req.account;

			if (requestingAdmin?.type !== 'admin') {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Admin access required');
			}

			const superAdmin = await db.admins.findById(requestingAdmin.id);

			if (!superAdmin?.isSuperAdmin) {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Super admin access required');
			}

			const adminToDeactivate = await db.admins.findById(req.params.id);

			if (!adminToDeactivate) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin not found');
			}

			if (adminToDeactivate.isSuperAdmin) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Cannot deactivate super admin');
			}

			if (!adminToDeactivate.isActive) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Admin is already deactivated');
			}

			// Deactivate the admin
			adminToDeactivate.isActive = false;
			await adminToDeactivate.save();

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					id: adminToDeactivate.id,
					email: adminToDeactivate.email,
					firstName: adminToDeactivate.firstName,
					lastName: adminToDeactivate.lastName,
					isActive: adminToDeactivate.isActive,
				},
				'Admin account deactivated successfully'
			);
		} catch (error) {
			console.error('Error in deactivate admin:', error);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to deactivate admin account'
			);
		}
	}
);

// DELETE /auth/admin/:id - Delete admin account (super admin only)
router.delete(
	'/admin/:id',
	authenticate,
	async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const requestingAdmin = req.account;

			if (requestingAdmin?.type !== 'admin') {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Admin access required');
			}

			const superAdmin = await db.admins.findById(requestingAdmin.id);

			if (!superAdmin?.isSuperAdmin) {
				return sendNormalized(res, StatusCodes.FORBIDDEN, null, 'Super admin access required');
			}

			const adminToDelete = await db.admins.findById(req.params.id);

			if (!adminToDelete) {
				return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin not found');
			}

			if (adminToDelete.isSuperAdmin) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Cannot delete super admin');
			}

			// Prevent deleting yourself
			if (adminToDelete.id === superAdmin.id) {
				return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Cannot delete your own account');
			}

			await db.admins.findByIdAndDelete(req.params.id);

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ id: adminToDelete.id, email: adminToDelete.email },
				'Admin account deleted successfully'
			);
		} catch (error) {
			console.error('Error in delete admin:', error);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to delete admin account'
			);
		}
	}
);

export default router;
