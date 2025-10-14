import { faker } from '@faker-js/faker';
import * as geolib from 'geolib';
import { v4 as uuidv4 } from 'uuid';
import { db } from '.';
import { APPOINTMENT_STATUSES } from '../interfaces';
import logger from '../utils/logger';
import { Password } from '../utils/password';
import { MobileProvider, PaymentStatus } from './models/Payment';

// Center coordinates (Kampala)
const centerCoords = {
	lat: 0.3323315,
	lng: 32.5678668,
};

function generateRandomLocation(centerCoords: { lat: number; lng: number }) {
	const maxDistance = 10000; // 10 km in meters
	const randomDistance = Math.random() * maxDistance;
	const randomBearing = Math.random() * 360;

	const newCoords = geolib.computeDestinationPoint(centerCoords, randomDistance, randomBearing);

	return {
		type: 'Point',
		coordinates: [newCoords.longitude, newCoords.latitude], // GeoJSON format: [longitude, latitude]
	};
}

export async function seedDatabase() {
	try {
		logger.debug('Starting database seeding...');

		// Clear all collections
		await Promise.all([
			db.admins.deleteMany({}),
			db.nurses.deleteMany({}),
			db.patients.deleteMany({}),
			db.appointments.deleteMany({}),
			db.payments.deleteMany({}),
		]);

		// Seed admins
		const admins = await seedAdmins();
		logger.debug('✓ Admins seeded ' + admins.length);

		// Seed nurses
		const nurses = await seedNurses();
		logger.debug('✓ Nurses seeded ' + nurses.length);

		// Seed patients
		const patients = await seedPatients();
		logger.debug('✓ Patients seeded ' + patients.length);

		// Seed appointments
		const appointments = await seedAppointments(patients, nurses);
		logger.debug('✓ Appointments seeded ' + appointments.length);

		// Seed payments
		const payments = await seedPayments(appointments, patients);
		logger.debug('✓ Payments seeded ' + payments.length);

		// Map appointmentId to paymentIds
		const appointmentPaymentsMap = new Map();
		for (const payment of payments) {
			const aid = payment.appointment.toString();
			if (!appointmentPaymentsMap.has(aid)) {
				appointmentPaymentsMap.set(aid, []);
			}
			appointmentPaymentsMap.get(aid).push(payment._id);
		}
		// Update each appointment's payments array
		const bulkOps = [];
		for (const [aid, paymentIds] of appointmentPaymentsMap.entries()) {
			bulkOps.push({
				updateOne: {
					filter: { _id: aid },
					update: { $set: { payments: paymentIds } },
				},
			});
		}
		if (bulkOps.length > 0) {
			await db.appointments.bulkWrite(bulkOps);
		}

		logger.debug('Database seeding completed successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}

async function seedAdmins() {
	const admins = [];
	for (let i = 0; i < 5; i++) {
		admins.push({
			email: faker.internet.email(),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: await Password.hash('password'),
			isEmailVerified: true,
		});
	}
	return await db.admins.insertMany(admins);
}

async function seedNurses() {
	const nurses = [];
	const qualificationTypes = ['certification', 'cv', 'other'];
	const docFormats = ['jpg', 'png', 'pdf', 'docx'];
	for (let i = 0; i < 50; i++) {
		const profilePicture = {
			publicId: faker.string.uuid(),
			url: faker.image.avatar(),
			secureUrl: faker.image.avatar(),
			format: faker.helpers.arrayElement(docFormats),
			resourceType: 'image',
			size: faker.number.int({ min: 10000, max: 500000 }),
			uploadedAt: faker.date.past(),
			originalName: faker.system.fileName(),
		};
		const nationalIdFront = {
			publicId: faker.string.uuid(),
			url: faker.image.urlPicsumPhotos(),
			secureUrl: faker.image.urlPicsumPhotos(),
			format: 'jpg',
			resourceType: 'image',
			size: faker.number.int({ min: 10000, max: 500000 }),
			uploadedAt: faker.date.past(),
			originalName: faker.system.fileName(),
		};
		const nationalIdBack = {
			publicId: faker.string.uuid(),
			url: faker.image.urlPicsumPhotos(),
			secureUrl: faker.image.urlPicsumPhotos(),
			format: 'jpg',
			resourceType: 'image',
			size: faker.number.int({ min: 10000, max: 500000 }),
			uploadedAt: faker.date.past(),
			originalName: faker.system.fileName(),
		};
		const qualifications = Array(faker.number.int({ min: 1, max: 3 }))
			.fill(null)
			.map(() => {
				const doc = {
					publicId: faker.string.uuid(),
					url: faker.image.urlPicsumPhotos(),
					secureUrl: faker.image.urlPicsumPhotos(),
					format: faker.helpers.arrayElement(docFormats),
					resourceType: faker.helpers.arrayElement(['image', 'raw', 'pdf']),
					size: faker.number.int({ min: 10000, max: 500000 }),
					uploadedAt: faker.date.past(),
					originalName: faker.system.fileName(),
				};
				return {
					id: faker.string.uuid(),
					type: faker.helpers.arrayElement(qualificationTypes),
					document: doc,
					title: faker.person.jobTitle(),
					description: faker.lorem.sentence(),
					uploadedAt: doc.uploadedAt,
				};
			});
		nurses.push({
			phone: `25677${faker.string.numeric(7)}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			isActive: faker.datatype.boolean(),
			isVerified: faker.datatype.boolean(),
			profilePicture,
			nationalId: { front: nationalIdFront, back: nationalIdBack },
			qualifications,
			documentVerificationStatus: faker.helpers.arrayElement(['pending', 'verified', 'rejected']),
		});
	}
	return await db.nurses.insertMany(nurses);
}

async function seedPatients() {
	const patients = [];
	for (let i = 0; i < 100; i++) {
		patients.push({
			phone: `25677${faker.string.numeric(7)}`,
			name: `${faker.person.firstName()} ${faker.person.lastName()}`,
			isPhoneVerified: true,
		});
	}
	return await db.patients.insertMany(patients);
}

async function seedAppointments(patients: any[], nurses: any[]) {
	const appointments = [];
	const symptoms = ['Fever', 'Cough', 'Fatigue', 'Headache', 'Body ache', 'Nausea'];

	for (let i = 0; i < 200; i++) {
		const patient = faker.helpers.arrayElement(patients);

		// 40% chance of not having a nurse assigned
		const shouldHaveNurse = faker.number.int({ min: 1, max: 100 }) > 40;
		const nurse = shouldHaveNurse ? faker.helpers.arrayElement(nurses) : undefined;

		// Status distribution based on nurse assignment
		let status;
		if (!nurse) {
			// Without nurse, can only be PENDING or CANCELLED
			status = faker.helpers.arrayElement([
				APPOINTMENT_STATUSES.PENDING,
				APPOINTMENT_STATUSES.PENDING,
				APPOINTMENT_STATUSES.PENDING,
				APPOINTMENT_STATUSES.CANCELLED,
			]); // More weight to PENDING
		} else {
			// With nurse, can be any status but weighted
			status = faker.helpers.arrayElement([
				APPOINTMENT_STATUSES.ASSIGNED,
				APPOINTMENT_STATUSES.ASSIGNED,
				APPOINTMENT_STATUSES.IN_PROGRESS,
				APPOINTMENT_STATUSES.IN_PROGRESS,
				APPOINTMENT_STATUSES.COMPLETED,
				APPOINTMENT_STATUSES.CANCELLED,
			]);
		}

		const appointmentDate = faker.date.recent({ days: 30 });
		const appointment: any = {
			patient: patient._id,
			symptoms: faker.helpers.arrayElements(symptoms, { min: 1, max: 3 }),
			status,
			date: appointmentDate,
			description: faker.lorem.sentence(),
			// Assign a random location to appointments to simulate scheduling coordinates
			location: generateRandomLocation(centerCoords),
		};

		// Only add nurse-related fields if nurse is assigned
		if (nurse) {
			appointment.nurse = nurse._id;
			appointment.nurseAssignedAt = faker.date.between({
				from: appointmentDate,
				to: new Date(),
			});
			appointment.assignedBy = faker.helpers.arrayElement(
				[...Array(5)].map(() => faker.database.mongodbObjectId())
			); // Random admin ID
			appointment.nurseNotified = true;
			appointment.patientNotified = true;
			appointment.lastNotificationSent = appointment.nurseAssignedAt;
		}

		// Add cancellation details for cancelled appointments
		if (status === APPOINTMENT_STATUSES.CANCELLED) {
			appointment.cancellationReason = faker.helpers.arrayElement([
				'Patient request',
				'Nurse unavailable',
				'Emergency',
				'Schedule conflict',
				'Weather conditions',
			]);
			appointment.cancelledAt = faker.date.between({
				from: appointmentDate,
				to: new Date(),
			});
			appointment.cancelledBy = faker.helpers.arrayElement(
				[...Array(5)].map(() => faker.database.mongodbObjectId())
			); // Random admin ID
		}

		appointments.push(appointment);
	}
	return await db.appointments.insertMany(appointments);
}

async function seedPayments(appointments: any[], patients: any[]) {
	const payments = [];
	const paymentMethods = [MobileProvider.MTN, MobileProvider.AIRTEL];
	const statuses = [
		PaymentStatus.PENDING,
		PaymentStatus.SUCCESSFUL,
		PaymentStatus.FAILED,
		PaymentStatus.PROCESSING,
	];

	for (let i = 0; i < appointments.length; i++) {
		if (faker.number.int({ min: 1, max: 100 }) <= 70) {
			// 70% of appointments have payments
			const appointment = appointments[i];
			const patientId = appointment.patient;
			const patient = patients.find((p) => p._id.toString() === patientId.toString());
			const status = faker.helpers.arrayElement(statuses);
			const amount = faker.number.int({ min: 20000, max: 100000 });
			const initiatedDate = faker.date.between({
				from: appointment.date,
				to: new Date(),
			});

			payments.push({
				appointment: appointment._id,
				patient: patientId,
				amount,
				amountFormatted: new Intl.NumberFormat('en-UG', {
					style: 'decimal',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(amount),
				currency: 'UGX',
				reference: uuidv4(),
				externalUuid: uuidv4(),
				providerReference:
					status === PaymentStatus.SUCCESSFUL
						? faker.string.alphanumeric(15).toUpperCase()
						: undefined,
				phoneNumber: patient?.phone || `+256${faker.string.numeric(9)}`,
				status,
				paymentMethod: faker.helpers.arrayElement(paymentMethods),
				description: faker.lorem.sentence(),
				transactionId:
					status === PaymentStatus.SUCCESSFUL
						? faker.string.alphanumeric(15).toUpperCase()
						: undefined,
				callbackUrl: 'http://localhost:3000/api/v1/payments/webhooks/collection',
				country: 'UG',
				mode: 'live',
				initiatedAt: initiatedDate,
				estimatedSettlement: faker.date.soon({ days: 1, refDate: initiatedDate }),
				completedAt:
					status === PaymentStatus.SUCCESSFUL || status === PaymentStatus.FAILED
						? faker.date.between({ from: initiatedDate, to: new Date() })
						: undefined,
				failureReason: status === PaymentStatus.FAILED ? faker.lorem.sentence() : undefined,
				webhookAttempts: faker.number.int({ min: 0, max: 3 }),
			});
		}
	}
	return await db.payments.insertMany(payments);
}

if (require.main === module) {
	seedDatabase()
		.then(() => {
			logger.debug('Seeding completed successfully!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seeding failed:', error);
			process.exit(1);
		});
}
