import { faker } from '@faker-js/faker';
import * as geolib from 'geolib';
import { db } from '.';
import { APPOINTMENT_STATUSES } from '../interfaces';
import { Password } from '../utils/password';

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
		console.log('Starting database seeding...');

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
		console.log('✓ Admins seeded', admins.length);

		// Seed nurses
		const nurses = await seedNurses();
		console.log('✓ Nurses seeded', nurses.length);

		// Seed patients
		const patients = await seedPatients();
		console.log('✓ Patients seeded', patients.length);

		// Seed appointments
		const appointments = await seedAppointments(patients, nurses);
		console.log('✓ Appointments seeded', appointments.length);

		// Seed payments
		const payments = await seedPayments(appointments, patients);
		console.log('✓ Payments seeded', payments.length);
		console.log('Database seeding completed successfully!');
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
			password: await Password.hash('password'),
			isEmailVerified: true,
		});
	}
	return await db.admins.insertMany(admins);
}

async function seedNurses() {
	const nurses = [];
	for (let i = 0; i < 50; i++) {
		nurses.push({
			phone: `25677${faker.string.numeric(7)}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			qualifications: Array(3)
				.fill(null)
				.map(() =>
					faker.helpers.arrayElement([
						'Registered Nurse',
						'Licensed Practical Nurse',
						'Certified Nursing Assistant',
						'Home Health Aide',
						'Personal Care Aide',
					])
				),
			imgUrl: faker.image.avatar(),
			isActive: true,
			isVerified: true,
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
			location: generateRandomLocation(centerCoords),
		});
	}
	return await db.patients.insertMany(patients);
}

async function seedAppointments(patients: any[], nurses: any[]) {
	const appointments = [];
	const statuses = Object.values(APPOINTMENT_STATUSES);
	const symptoms = ['Fever', 'Cough', 'Fatigue', 'Headache', 'Body ache', 'Nausea'];

	for (let i = 0; i < 200; i++) {
		const patient = faker.helpers.arrayElement(patients);
		const nurse = faker.helpers.arrayElement(nurses);

		appointments.push({
			patient: patient.id,
			nurse: nurse.id,
			symptoms: faker.helpers.arrayElements(symptoms, { min: 1, max: 3 }),
			status: faker.helpers.arrayElement(statuses),
			date: faker.date.recent({ days: 30 }),
		});
	}
	return await db.appointments.insertMany(appointments);
}

async function seedPayments(appointments: any[], _patients: any[]) {
	const payments = [];
	const paymentMethods = ['MTN', 'AIRTEL'];
	const statuses = ['PENDING', 'SUCCESSFUL', 'FAILED'];

	for (let i = 0; i < appointments.length; i++) {
		if (faker.number.int({ min: 1, max: 100 }) <= 70) {
			// 70% of appointments have payments
			payments.push({
				appointment: appointments[i].id,
				patient: appointments[i].patient,
				amount: faker.number.int({ min: 20000, max: 100000 }),
				referenceId: faker.string.alphanumeric(10).toUpperCase(),
				status: faker.helpers.arrayElement(statuses),
				paymentMethod: faker.helpers.arrayElement(paymentMethods),
				comment: faker.lorem.sentence(),
				transactionId: faker.string.alphanumeric(15).toUpperCase(),
			});
		}
	}
	return await db.payments.insertMany(payments);
}

// Run seeding if this file is executed directly
if (require.main === module) {
	seedDatabase()
		.then(() => {
			console.log('Seeding completed successfully!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seeding failed:', error);
			process.exit(1);
		});
}
