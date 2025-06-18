import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import { response } from '../utils/http-response';
import logger from '../utils/logger';
import { ChannelType, messagingService } from './messaging';

// Nurse assignment request interface
export interface NurseAssignmentRequest {
	appointmentId: string;
	nurseId: string;
	notes?: string;
}

// Nurse assignment response interface
export interface NurseAssignmentResponse {
	success: boolean;
	message: string;
	data?: any;
	errors?: string[];
}

// Notification templates
const NOTIFICATION_TEMPLATES = {
	nurseAssignment: {
		subject: 'New Appointment Assignment',
		text: 'You have been assigned to a new appointment. Please review the details and confirm.',
		html: (appointment: any, nurse: any) => `
			<h2>New Appointment Assignment</h2>
			<p>Hello ${nurse.firstName} ${nurse.lastName},</p>
			<p>You have been assigned to a new appointment with the following details:</p>
			<ul>
				<li><strong>Patient:</strong> ${appointment.patient.name}</li>
				<li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
				<li><strong>Time:</strong> ${new Date(appointment.date).toLocaleTimeString()}</li>
				<li><strong>Symptoms:</strong> ${appointment.symptoms.join(', ')}</li>
			</ul>
			<p>Please review the appointment details and confirm your availability.</p>
			<p>Best regards,<br>Link Bed Sides Team</p>
		`,
	},
	patientNotification: {
		subject: 'Nurse Assigned to Your Appointment',
		text: 'A nurse has been assigned to your appointment. You will be contacted shortly.',
		html: (appointment: any, nurse: any) => `
			<h2>Nurse Assigned to Your Appointment</h2>
			<p>Hello ${appointment.patient.name},</p>
			<p>Great news! A nurse has been assigned to your appointment:</p>
			<ul>
				<li><strong>Nurse:</strong> ${nurse.firstName} ${nurse.lastName}</li>
				<li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
				<li><strong>Time:</strong> ${new Date(appointment.date).toLocaleTimeString()}</li>
			</ul>
			<p>The nurse will contact you shortly to confirm the appointment details.</p>
			<p>Best regards,<br>Link Bed Sides Team</p>
		`,
	},
};

class NurseAssignmentService {
	private static instance: NurseAssignmentService;

	private constructor() {}

	public static getInstance(): NurseAssignmentService {
		if (!NurseAssignmentService.instance) {
			NurseAssignmentService.instance = new NurseAssignmentService();
		}
		return NurseAssignmentService.instance;
	}

	/**
	 * Assign a nurse to an appointment
	 */
	public async assignNurseToAppointment(
		request: NurseAssignmentRequest,
		adminId: string
	): Promise<NurseAssignmentResponse> {
		try {
			const { appointmentId, nurseId, notes } = request;

			// Validate appointment exists and is pending
			const appointment = await db.appointments
				.findById(appointmentId)
				.populate('patient')
				.populate('nurse');

			if (!appointment) {
				return {
					success: false,
					message: 'Appointment not found',
				};
			}

			if (appointment.status !== APPOINTMENT_STATUSES.PENDING) {
				return {
					success: false,
					message: 'Appointment is not in pending status',
				};
			}

			if (appointment.nurse) {
				return {
					success: false,
					message: 'Appointment already has a nurse assigned',
				};
			}

			// Validate nurse exists and is active
			const nurse = await db.nurses.findById(nurseId);
			if (!nurse) {
				return {
					success: false,
					message: 'Nurse not found',
				};
			}

			if (!nurse.isActive) {
				return {
					success: false,
					message: 'Nurse is not active',
				};
			}

			// Assign nurse to appointment
			await appointment.assignNurse(nurseId, adminId, notes);

			// Send notifications
			const notificationResults = await this.sendAssignmentNotifications(appointment, nurse);

			// Mark notifications as sent
			await appointment.markNotificationsSent();

			logger.info(`Nurse ${nurseId} assigned to appointment ${appointmentId} by admin ${adminId}`);

			return {
				success: true,
				message: 'Nurse assigned successfully',
				data: {
					appointmentId: appointment._id,
					nurseId,
					status: appointment.status,
					nurseAssignedAt: appointment.nurseAssignedAt,
					notifications: notificationResults,
				},
			};
		} catch (error) {
			logger.error('Nurse assignment failed:', error);
			return {
				success: false,
				message: 'Failed to assign nurse to appointment',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Send notifications to nurse and patient
	 */
	private async sendAssignmentNotifications(appointment: any, nurse: any): Promise<any[]> {
		const results = [];

		try {
			// Send notification to nurse
			if (nurse.email) {
				const nurseTemplate = NOTIFICATION_TEMPLATES.nurseAssignment;
				const nurseResult = await messagingService.sendNotification(
					nurse.email,
					nurseTemplate.text,
					{
						channel: ChannelType.EMAIL,
						template: {
							subject: nurseTemplate.subject,
							text: nurseTemplate.text,
							html: nurseTemplate.html(appointment, nurse),
						},
					}
				);
				results.push({
					recipient: 'nurse',
					channel: ChannelType.EMAIL,
					success: nurseResult[0]?.success,
				});
			}

			if (nurse.phone) {
				const nurseSMSResult = await messagingService.sendNotification(
					nurse.phone,
					`You have been assigned to an appointment with ${appointment.patient.name} on ${new Date(appointment.date).toLocaleDateString()}. Please check your email for details.`,
					{ channel: ChannelType.SMS }
				);
				results.push({ recipient: 'nurse', channel: 'sms', success: nurseSMSResult[0]?.success });
			}

			// Send notification to patient
			if (appointment.patient.phone) {
				const patientSMSResult = await messagingService.sendNotification(
					appointment.patient.phone,
					`A nurse has been assigned to your appointment on ${new Date(appointment.date).toLocaleDateString()}. You will be contacted shortly.`,
					{ channel: ChannelType.SMS }
				);
				results.push({
					recipient: 'patient',
					channel: 'sms',
					success: patientSMSResult[0]?.success,
				});
			}

			logger.info(`Assignment notifications sent for appointment ${appointment._id}`, results);
		} catch (error) {
			logger.error('Failed to send assignment notifications:', error);
			results.push({
				recipient: 'error',
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		}

		return results;
	}

	/**
	 * Get pending appointments (without assigned nurses)
	 */
	public async getPendingAppointments(): Promise<NurseAssignmentResponse> {
		try {
			const pendingAppointments = await db.appointments
				.find({
					status: APPOINTMENT_STATUSES.PENDING,
					nurse: { $exists: false },
				})
				.populate('patient')
				.sort({ createdAt: 'desc' });

			return {
				success: true,
				message: 'Pending appointments retrieved successfully',
				data: pendingAppointments,
			};
		} catch (error) {
			logger.error('Failed to get pending appointments:', error);
			return {
				success: false,
				message: 'Failed to retrieve pending appointments',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Get available nurses for assignment
	 */
	public async getAvailableNurses(): Promise<NurseAssignmentResponse> {
		try {
			const availableNurses = await db.nurses
				.find({
					isActive: true,
					isVerified: true,
				})
				.select('firstName lastName email phone isActive isVerified');

			return {
				success: true,
				message: 'Available nurses retrieved successfully',
				data: availableNurses,
			};
		} catch (error) {
			logger.error('Failed to get available nurses:', error);
			return {
				success: false,
				message: 'Failed to retrieve available nurses',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Get nurse's assigned appointments
	 */
	public async getNurseAppointments(nurseId: string): Promise<NurseAssignmentResponse> {
		try {
			const appointments = await db.appointments
				.find({
					nurse: nurseId,
					status: { $in: [APPOINTMENT_STATUSES.ASSIGNED, APPOINTMENT_STATUSES.IN_PROGRESS] },
				})
				.populate('patient')
				.sort({ date: 'asc' });

			return {
				success: true,
				message: 'Nurse appointments retrieved successfully',
				data: appointments,
			};
		} catch (error) {
			logger.error('Failed to get nurse appointments:', error);
			return {
				success: false,
				message: 'Failed to retrieve nurse appointments',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Reassign nurse to appointment
	 */
	public async reassignNurse(
		appointmentId: string,
		newNurseId: string,
		adminId: string,
		reason?: string
	): Promise<NurseAssignmentResponse> {
		try {
			const appointment = await db.appointments
				.findById(appointmentId)
				.populate('patient')
				.populate('nurse');

			if (!appointment) {
				return {
					success: false,
					message: 'Appointment not found',
				};
			}

			if (!appointment.nurse) {
				return {
					success: false,
					message: 'Appointment has no nurse assigned to reassign',
				};
			}

			// Validate new nurse
			const newNurse = await db.nurses.findById(newNurseId);
			if (!newNurse || !newNurse.isActive) {
				return {
					success: false,
					message: 'New nurse not found or not active',
				};
			}

			// Store old nurse for notification
			const oldNurse = appointment.nurse;

			// Reassign nurse
			await appointment.assignNurse(newNurseId, adminId, reason);

			// Send reassignment notifications
			await this.sendReassignmentNotifications(appointment, oldNurse, newNurse);

			logger.info(
				`Nurse reassigned for appointment ${appointmentId}: ${oldNurse._id} -> ${newNurseId}`
			);

			return {
				success: true,
				message: 'Nurse reassigned successfully',
				data: {
					appointmentId: appointment._id,
					oldNurseId: oldNurse._id,
					newNurseId,
					status: appointment.status,
					nurseAssignedAt: appointment.nurseAssignedAt,
				},
			};
		} catch (error) {
			logger.error('Nurse reassignment failed:', error);
			return {
				success: false,
				message: 'Failed to reassign nurse',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Send reassignment notifications
	 */
	private async sendReassignmentNotifications(
		appointment: any,
		oldNurse: any,
		newNurse: any
	): Promise<void> {
		try {
			// Notify old nurse
			if (oldNurse.email) {
				await messagingService.sendNotification(
					oldNurse.email,
					`You have been unassigned from appointment with ${appointment.patient.name} on ${new Date(appointment.date).toLocaleDateString()}.`,
					{ channel: ChannelType.EMAIL }
				);
			}

			// Notify new nurse
			if (newNurse.email) {
				const nurseTemplate = NOTIFICATION_TEMPLATES.nurseAssignment;
				await messagingService.sendNotification(newNurse.email, nurseTemplate.text, {
					channel: ChannelType.EMAIL,
					template: {
						subject: 'Appointment Reassignment',
						text: nurseTemplate.text,
						html: nurseTemplate.html(appointment, newNurse),
					},
				});
			}

			// Notify patient
			if (appointment.patient.phone) {
				await messagingService.sendNotification(
					appointment.patient.phone,
					`Your appointment nurse has been changed. The new nurse will contact you shortly.`,
					{ channel: ChannelType.SMS }
				);
			}
		} catch (error) {
			logger.error('Failed to send reassignment notifications:', error);
		}
	}
}

// Export singleton instance
export const nurseAssignmentService = NurseAssignmentService.getInstance();

// Express middleware for handling assignment responses
export const handleAssignmentResponse = (
	res: Response,
	assignmentResponse: NurseAssignmentResponse
): void => {
	if (assignmentResponse.success) {
		response(StatusCodes.OK, assignmentResponse.data, assignmentResponse.message);
	} else {
		response(StatusCodes.BAD_REQUEST, null, assignmentResponse.message);
	}
};
