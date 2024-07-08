import { db } from '../db';
import { Payment } from '../db/schemas/Payment';
import { faker } from '@faker-js/faker';
import * as geolib from 'geolib';
import { APPOINTMENT_STATUSES, DESIGNATION } from '../interfaces';
import { PatientRepo } from '../modules/users/patients/repository';
import { AppointmentRepo } from '../modules/appointments/repository';
import { CaregiverRepo } from '../modules/users/caregivers/repository';
import { Patient } from './schemas/Patient';

export async function seedPayments() {
	await db.payments.deleteMany({}, { maxTimeMS: 30000 });
	const patients = await PatientRepo.getAllPatients();
	const appointments = await AppointmentRepo.getAllAppointments();

	const payments = [];
	for (let i = 0; i < 10; i++) {
		const payment: Payment = {
			patient: faker.helpers.arrayElement(patients),
			appointment: faker.helpers.arrayElement(appointments),
			amount: faker.helpers.arrayElement([1200, 15000, 50000, 54000, 25000, 100000, 51000, 32000]),
			comment: faker.helpers.arrayElement(['alsdfasdfasd', 'asdfasdfasd', 'asdfasdasd']),
		};

		payments.push(payment);
	}

	await db.payments.insertMany(payments);
}

export async function seedAppointments() {
	await db.appointments.deleteMany({}, { maxTimeMS: 30000 });
	const caregiverIds = (await CaregiverRepo.getAllCaregivers()).map((caregiver) => caregiver._id);
	const patientIds = (await PatientRepo.getAllPatients()).map((patient) => patient._id);

	const appointments = [];
	for (let i = 0; i < 100; i++) {
		const appointment = {
			patient: faker.helpers.arrayElement(patientIds) as unknown as string,
			caregiver: faker.helpers.arrayElement(caregiverIds) as unknown as string,
			reason: faker.lorem.slug(5),
			status: faker.helpers.arrayElement(Object.values(APPOINTMENT_STATUSES)),
			date: faker.date.past(),
			description: faker.lorem.lines(2),
			notes: faker.lorem.lines(3),
		};
		appointments.push(appointment);
	}
	await db.appointments.insertMany(appointments);
}

export async function seedRatings() {
	await db.ratings.deleteMany({}, { maxTimeMS: 30000 });
	const caregiverIds = (await CaregiverRepo.getAllCaregivers()).map((caregiver) => caregiver._id);
	const patientIds = (await PatientRepo.getAllPatients()).map((patient) => patient._id);

	const ratings = [];
	for (let i = 0; i < 1000; i++) {
		const rating = {
			patient: faker.helpers.arrayElement(patientIds) as unknown as string,
			caregiver: faker.helpers.arrayElement(caregiverIds) as unknown as string,
			review: faker.lorem.sentence({ max: 20, min: 8 }),
			value: faker.number.int({ min: 1, max: 5 }),
		};

		ratings.push(rating);
	}

	await db.ratings.insertMany(ratings);
}
export async function seedCaregivers() {
	await db.caregivers.deleteMany({}, { maxTimeMS: 30000 });

	const centerCoords = {
		lat: 0.3323315,
		lng: 32.5678668,
	};

	const caregivers = [];
	for (let i = 0; i < 100; i++) {
		const caregiver = {
			designation: DESIGNATION.CAREGIVER,
			phone: `256456789${i.toString().padStart(2, '0')}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: 'password',
			location: generateRandomLocation(centerCoords),
			isPhoneVerified: faker.datatype.boolean(),
			dateOfBirth: faker.date.past(),
			nin: `NIN${i.toString().padStart(2, '0')}`,
			description: faker.person.bio(),
			rating: (i % 5) + 1,
			experience: i * 2,
			imgUrl: faker.image.avatar(),
			isBanned: faker.datatype.boolean(),
			isActive: faker.datatype.boolean(),
			isVerified: faker.datatype.boolean(),
		};

		caregivers.push(caregiver);
	}

	await db.caregivers.insertMany(caregivers);
}

export async function seedPatients() {
	await db.patients.deleteMany({}, { maxTimeMS: 30000 });
	const patients = [];
	for (let i = 0; i < 100; i++) {
		const patient: Patient = {
			designation: DESIGNATION.PATIENT,
			phone: `256456789${i.toString().padStart(2, '0')}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			isPhoneVerified: faker.datatype.boolean(),
			isBanned: faker.datatype.boolean(),
			isActive: faker.datatype.boolean(),
			isVerified: faker.datatype.boolean(),
		};

		patients.push(patient);
	}

	await db.patients.insertMany(patients);
}

export async function seedAdmins() {
	await db.admins.deleteMany({}, { maxTimeMS: 30000 });
	const admins = [];
	for (let i = 0; i < 10; i++) {
		const admin = {
			designation: DESIGNATION.ADMIN,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: 'password',
			isEmailVerified: faker.datatype.boolean(),
			isBanned: faker.datatype.boolean(),
			isActive: faker.datatype.boolean(),
			email: faker.internet.email(),
		};

		admins.push(admin);
	}

	await db.admins.insertMany(admins);
}

function generateRandomLocation(centerCoords: { lat: number; lng: number }) {
	const maxDistance = 25000; // 25 km in meters
	const randomDistance = Math.random() * maxDistance;
	const randomBearing = Math.random() * 360;

	const newCoords = geolib.computeDestinationPoint(centerCoords, randomDistance, randomBearing);

	return {
		type: 'Point',
		coordinates: [newCoords.latitude, newCoords.longitude],
	};
}
