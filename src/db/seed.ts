import mongoose from 'mongoose';
import { db } from '../db';
import { Payment } from '../db/schemas/Payment';
import { APPOINTMENT_STATUSES } from '../interfaces/appointment-statuses';
import { DESIGNATION } from '../interfaces/designations';
import { faker } from '@faker-js/faker';
import * as geolib from "geolib";

export async function seedPayments() {
	await db.payments.deleteMany( {}, { maxTimeMS: 30000 } )
	const caregiverIds = ( await db.caregivers.find( {} ) ).map( ( c => c._id ) )
	const patientIds = ( await db.patients.find( {} ) ).map( p => p._id )
	const appointmentIds = ( await db.appointments.find( {} ) ).map( a => a._id )

	const payments = []
	for ( let i = 0; i < 10; i++ ) {
		const payment: Payment = {
			patientId: faker.helpers.arrayElement( patientIds ) as unknown as string,
			appointmentId: faker.helpers.arrayElement( appointmentIds ) as unknown as string,
			amount: faker.helpers.arrayElement( [1200, 15000, 50000, 54000, 25000, 100000, 51000, 32000] ),
			caregiverId: faker.helpers.arrayElement( caregiverIds ) as unknown as string,
			comment: faker.helpers.arrayElement( caregiverIds ) as unknown as string,
		};

		payments.push( payment );
	}

	await db.payments.insertMany( payments );
}

export async function seedAppointments() {
	await db.appointments.deleteMany( {}, { maxTimeMS: 30000 } )
	const caregivers = await db.caregivers.find( {} )
	const patients = await db.patients.find( {} )

	const appointments = []
	for ( let i = 0; i < 10; i++ ) {
		const appointment = {
			patient: faker.helpers.arrayElement( patients ) as unknown as mongoose.Document,
			caregiver: faker.helpers.arrayElement( caregivers ) as unknown as mongoose.Document,
			title: faker.lorem.slug( 5 ),
			status: faker.helpers.arrayElement( Object.values( APPOINTMENT_STATUSES ) ),
			date: faker.date.past(),
			description: faker.lorem.lines( 2 ),
			notes: faker.lorem.lines( 3 ),

		};
		appointments.push( appointment );
	}
	await db.appointments.insertMany( appointments );
}

export async function seedRatings() {
	await db.ratings.deleteMany( {}, { maxTimeMS: 30000 } )
	const caregiverIds = ( await db.caregivers.find( {} ) ).map( ( c => c._id ) )
	const patientIds = ( await db.patients.find( {} ) ).map( p => p._id )

	const ratings = []
	for ( let i = 0; i < 10; i++ ) {
		const rating = {
			patientId: faker.helpers.arrayElement( patientIds ) as unknown as string,
			caregiverId: faker.helpers.arrayElement( caregiverIds ) as unknown as string,
			review: faker.lorem.sentence( { max: 20, min: 8 } ),
			value: faker.number.int( { min: 1, max: 5 } ),
		};

		ratings.push( rating );
	}

	await db.ratings.insertMany( ratings );
}

export async function seedCaregivers() {
	await db.caregivers.deleteMany( {}, { maxTimeMS: 30000 } )

	const centerCoords = {
		lat: 0.3322221,
		lng: 32.5704806,
	};

	const caregivers = [];
	for ( let i = 0; i < 10; i++ ) {
		const caregiver = {
			designation: DESIGNATION.NURSE,
			phone: `256456789${i.toString().padStart( 2, '0' )}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: "password",
			location: generateRandomLocation( centerCoords ),
			isPhoneVerified: faker.datatype.boolean(),
			dateOfBirth: faker.date.past(),
			nin: `NIN${i.toString().padStart( 2, '0' )}`,
			medicalLicenseNumber: faker.number.int( { min: 10000000 } ),
			description: faker.person.bio(),
			rating: i % 5 + 1,
			placeOfReception: faker.location.city(),
			address: faker.location.city(),
			speciality: faker.helpers.arrayElements( ['elderly', 'infant', 'dental', 'women'], 2 ),
			languages: faker.helpers.arrayElement( ['English', 'Luganda', 'kiswahili'] ),
			affiliations: faker.helpers.arrayElements( ['Affiliation1', 'Affiliation2', 'Affiliation3', 'Affiliation1'], 2 ),
			experience: i * 2,
			servicesOffered: faker.helpers.arrayElements( ['elderly', 'infant', 'dental', 'women'], 2 ),
			imgUrl: faker.image.avatar(),
			isBanned: faker.datatype.boolean(),
			isDeactivated: faker.datatype.boolean(),
			isVerified: faker.datatype.boolean(),
		};

		caregivers.push( caregiver );
	}

	await db.caregivers.insertMany( caregivers );
}

export async function seedPatients() {
	const centerCoords = {
		lat: 0.3322221,
		lng: 32.5704806,
	};
	await db.patients.deleteMany( {}, { maxTimeMS: 30000 } )
	const patients = []
	for ( let i = 0; i < 10; i++ ) {
		const patient = {
			designation: DESIGNATION.PATIENT,
			phone: `256456789${i.toString().padStart( 2, '0' )}`,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: "password",
			location: generateRandomLocation( centerCoords ),
			isPhoneVerified: faker.datatype.boolean(),
			dob: faker.date.past(),
			isBanned: faker.datatype.boolean(),
			isDeactivated: faker.datatype.boolean(),
			isVerified: faker.datatype.boolean(),
			email: faker.internet.email(),
		};

		patients.push( patient );
	}

	await db.patients.insertMany( patients );
}

export async function seedAdmins() {
	await db.admins.deleteMany( {}, { maxTimeMS: 30000 } )
	const admins = []
	for ( let i = 0; i < 10; i++ ) {
		const admin = {
			designation: DESIGNATION.ADMIN,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: "password",
			isEmailVerified: faker.datatype.boolean(),
			isBanned: faker.datatype.boolean(),
			isDeactivated: faker.datatype.boolean(),
			email: faker.internet.email(),
		};

		admins.push( admin );
	}

	await db.admins.insertMany( admins );
}

function generateRandomLocation( centerCoords: {
	lat: number;
	lng: number;
} ) {
	const maxDistance = 25000; // 25 km in meters
	const randomDistance = Math.random() * maxDistance;
	const randomBearing = Math.random() * 360;

	const newCoords = geolib.computeDestinationPoint( centerCoords, randomDistance, randomBearing );

	return {
		type: 'Point',
		coordinates: [newCoords.latitude, newCoords.longitude],
	};
}

