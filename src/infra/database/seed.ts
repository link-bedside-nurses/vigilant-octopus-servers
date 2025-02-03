import { faker } from '@faker-js/faker';
import * as geolib from 'geolib';
import { APPOINTMENT_STATUSES, DESIGNATION } from '../../core/interfaces';
import { db } from '.';
import { Password } from '../../core/utils/password';

// Center coordinates (Kampala)
const centerCoords = {
	lat: 0.3323315,
	lng: 32.5678668,
};

function generateRandomLocation( centerCoords: { lat: number; lng: number } ) {
	const maxDistance = 10000; // 10 km in meters
	const randomDistance = Math.random() * maxDistance;
	const randomBearing = Math.random() * 360;

	const newCoords = geolib.computeDestinationPoint( centerCoords, randomDistance, randomBearing );

	return {
		type: 'Point',
		coordinates: [newCoords.longitude, newCoords.latitude], // GeoJSON format: [longitude, latitude]
	};
}

export async function seedDatabase() {
	try {
		console.log( 'Starting database seeding...' );

		// Clear all collections
		await Promise.all( [
			db.admins.deleteMany( {} ),
			db.caregivers.deleteMany( {} ),
			db.patients.deleteMany( {} ),
			db.appointments.deleteMany( {} ),
			db.payments.deleteMany( {} ),
			db.ratings.deleteMany( {} )
		] );

		// Seed admins
		const admins = await seedAdmins();
		console.log( '✓ Admins seeded', admins );

		// Seed caregivers
		const caregivers = await seedCaregivers();
		console.log( '✓ Caregivers seeded' );

		// Seed patients
		const patients = await seedPatients();
		console.log( '✓ Patients seeded' );

		// Seed appointments
		const appointments = await seedAppointments( patients, caregivers );
		console.log( '✓ Appointments seeded' );

		// Seed payments
		await seedPayments( appointments, patients );
		console.log( '✓ Payments seeded' );

		// Seed ratings
		await seedRatings( patients, caregivers );
		console.log( '✓ Ratings seeded' );

		console.log( 'Database seeding completed successfully!' );
	} catch ( error ) {
		console.error( 'Error seeding database:', error );
		throw error;
	}
}

async function seedAdmins() {
	const admins = [];
	for ( let i = 0; i < 5; i++ ) {
		admins.push( {
			designation: DESIGNATION.ADMIN,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: await Password.hash( 'password' ),
			email: faker.internet.email(),
			isEmailVerified: true,
			isBanned: false,
			isActive: true
		} );
	}
	return await db.admins.insertMany( admins );
}

async function seedCaregivers() {
	const caregivers = [];
	for ( let i = 0; i < 50; i++ ) {
		caregivers.push( {
			designation: DESIGNATION.CAREGIVER,
			phone: `25677${faker.string.numeric( 7 )}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: await Password.hash( 'password' ),
			email: faker.internet.email(),
			qualifications: Array( 3 ).fill( null ).map( () => faker.helpers.arrayElement( [
				'Registered Nurse', 'Licensed Practical Nurse', 'Certified Nursing Assistant',
				'Home Health Aide', 'Personal Care Aide'
			] ) ),
			location: generateRandomLocation( centerCoords ),
			isPhoneVerified: true,
			imgUrl: faker.image.avatar(),
			isBanned: false,
			isActive: true,
			isVerified: true,
			availability: {
				monday: { enabled: true, start: '00:00', end: '23:59' },
				tuesday: { enabled: true, start: '00:00', end: '23:59' },
				wednesday: { enabled: true, start: '00:00', end: '23:59' },
				thursday: { enabled: true, start: '00:00', end: '23:59' },
				friday: { enabled: true, start: '00:00', end: '23:59' },
				saturday: { enabled: true, start: '00:00', end: '23:59' },
				sunday: { enabled: true, start: '00:00', end: '23:59' }
			}
		} );
	}
	return await db.caregivers.insertMany( caregivers );
}

async function seedPatients() {
	const patients = [];
	for ( let i = 0; i < 100; i++ ) {
		patients.push( {
			designation: DESIGNATION.PATIENT,
			phone: `25677${faker.string.numeric( 7 )}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			location: generateRandomLocation( centerCoords ),
			isPhoneVerified: true,
			isBanned: false,
			isActive: true,
			isVerified: true,
			momoNumber: `25677${faker.string.numeric( 7 )}`,
			isMomoNumberVerified: true
		} );
	}
	return await db.patients.insertMany( patients );
}

async function seedAppointments( patients: any[], caregivers: any[] ) {
	const appointments = [];
	const statuses = Object.values( APPOINTMENT_STATUSES );
	const symptoms = ['Fever', 'Cough', 'Fatigue', 'Headache', 'Body ache', 'Nausea'];

	for ( let i = 0; i < 200; i++ ) {
		const patient = faker.helpers.arrayElement( patients );
		appointments.push( {
			patient: patient._id,
			caregiver: faker.helpers.arrayElement( caregivers )._id,
			symptoms: faker.helpers.arrayElements( symptoms, { min: 1, max: 3 } ),
			status: faker.helpers.arrayElement( statuses ),
			date: faker.date.recent( { days: 30 } ),
			location: patient.location,
			description: faker.lorem.sentence(),
			notes: faker.lorem.paragraph()
		} );
	}
	return await db.appointments.insertMany( appointments );
}

async function seedPayments( appointments: any[], patients: any[] ) {
	const payments = [];
	const paymentMethods = ['MTN', 'AIRTEL'];
	const statuses = ['PENDING', 'SUCCESSFUL', 'FAILED'];
	console.log( patients )


	for ( let i = 0; i < appointments.length; i++ ) {
		if ( faker.number.int( { min: 1, max: 100 } ) <= 70 ) { // 70% of appointments have payments
			payments.push( {
				appointment: appointments[i]._id,
				patient: appointments[i].patient,
				amount: faker.number.int( { min: 20000, max: 100000 } ),
				referenceId: faker.string.alphanumeric( 10 ).toUpperCase(),
				status: faker.helpers.arrayElement( statuses ),
				paymentMethod: faker.helpers.arrayElement( paymentMethods ),
				comment: faker.lorem.sentence(),
				transactionId: faker.string.alphanumeric( 15 ).toUpperCase()
			} );
		}
	}
	return await db.payments.insertMany( payments );
}

async function seedRatings( patients: any[], caregivers: any[] ) {
	const ratings = [];
	for ( let i = 0; i < 300; i++ ) {
		ratings.push( {
			patient: faker.helpers.arrayElement( patients )._id,
			caregiver: faker.helpers.arrayElement( caregivers )._id,
			review: faker.lorem.paragraph(),
			value: faker.number.int( { min: 3, max: 5 } )
		} );
	}
	return await db.ratings.insertMany( ratings );
}
