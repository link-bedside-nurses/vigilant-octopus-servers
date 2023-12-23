import mongoose from 'mongoose'

import logger from '../utils/logger'
import { EnvironmentVars } from '../constants'
import { db } from '@/db'
import { DESIGNATION } from '@/interfaces/designations'
import { faker } from "@faker-js/faker"
import * as geolib from "geolib"

const DATABASE_CONNECTION_URI = EnvironmentVars.getDatabaseUrl()
const DATABASE_NAME = EnvironmentVars.getDatabaseName()

export async function connectToDatabase() {
	try {
		const connection = await mongoose.connect( DATABASE_CONNECTION_URI, {
			dbName: DATABASE_NAME,
		} )
		logger.info( `Connected: ${connection.connection.db.databaseName}` )
	} catch ( error ) {
		logger.error( error )
		process.exit( 1 )
	}
}

export async function disconnectFromDatabase() {
	try {
		if ( mongoose.connection.id ) {
			await mongoose.connection.close()
			logger.info( 'disconnecting from db' )
		}
		return
	} catch ( error ) {
		logger.error( error, 'Error disconnecting db' )
	}
}

async function seedDatabase() {
	try {

		await db.caregivers.deleteMany( {}, { maxTimeMS: 30000 } )
		const centerCoords = {
			lat: 0.3322221,
			lng: 32.5704806,
		};

		const caregivers = [];
		for ( let i = 0; i < 30; i++ ) {
			const caregiverData = {
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

			caregivers.push( caregiverData );
		}

		await db.caregivers.insertMany( caregivers );

		console.log( 'Seed data inserted successfully!' );
	} catch ( error ) {
		console.error( 'Error seeding database:', error );
	} finally {

		mongoose.disconnect();
	}
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
		coords: {
			lat: newCoords.latitude,
			lng: newCoords.longitude,
		},
		type: 'Point',
		coordinates: [newCoords.latitude, newCoords.longitude],
	};
}


seedDatabase();
