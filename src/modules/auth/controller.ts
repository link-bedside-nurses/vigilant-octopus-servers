import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../core/utils/http-response';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import { ACCOUNT, DESIGNATION } from '../../core/interfaces';
import { createAccessToken } from '../../services/token';
import mongoose from 'mongoose';

export function requestAccountDeletion() {
	return async function ( request: HTTPRequest<object, { email: string }, object> ) {
		const { email } = request.body;

		if ( !email ) {
			return response( StatusCodes.BAD_REQUEST, null, 'Email is required' );
		}

		try {
			// Check if user exists as patient
			const patient = await PatientRepo.getPatientByEmail( email );

			// Check if user exists as caregiver
			const caregiver = await CaregiverRepo.getCaregiverByEmail( email );

			if ( !patient && !caregiver ) {
				return response( StatusCodes.NOT_FOUND, null, 'No account found with this email' );
			}

			// Process deletion based on account type
			if ( patient ) {
				await PatientRepo.markPatientForDeletion( patient._id.toString() );
			}

			if ( caregiver ) {
				await CaregiverRepo.markCaregiverForDeletion( caregiver._id.toString() );
			}

			return response(
				StatusCodes.OK,
				null,
				'Account deletion request received. Your account will be deleted within 7 days.'
			);
		} catch ( error ) {
			console.error( 'Error requesting account deletion:', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'An error occurred while processing your request'
			);
		}
	};
}

export function deleteAccount() {
	return async function ( request: HTTPRequest<object, object, object> ) {
		try {
			const accountId = request.account?.id;
			const designation = request.account?.designation;

			if ( !accountId ) {
				return response( StatusCodes.UNAUTHORIZED, null, 'User not authenticated' );
			}

			if ( designation === DESIGNATION.PATIENT ) {
				await PatientRepo.deletePatient( accountId );
			} else if ( designation === DESIGNATION.CAREGIVER ) {
				await CaregiverRepo.deleteCaregiver( accountId );
			} else {
				return response( StatusCodes.BAD_REQUEST, null, 'Invalid account type' );
			}

			return response( StatusCodes.OK, null, 'Account deleted successfully' );
		} catch ( error ) {
			console.error( 'Error deleting account:', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'An error occurred while deleting your account'
			);
		}
	};
}

export function getAccessToken() {
	return async function ( request: HTTPRequest<object, object, { designation: DESIGNATION }> ) {
		const designation = request.query.designation;
		console.log( 'designation', designation );

		if ( !designation ) {
			console.log( 'Designation must be specified' );
			return response( StatusCodes.BAD_REQUEST, null, 'Designation must be specified' );
		}

		let user;
		if ( designation === DESIGNATION.PATIENT ) {
			console.log( 'Getting patient by id', request.account?.id );
			user = await PatientRepo.getPatientById( request.account?.id! );
		} else if ( designation === DESIGNATION.CAREGIVER || designation === DESIGNATION.ADMIN ) {
			console.log( 'Getting caregiver by id', request.account?.id );
			user = await CaregiverRepo.getCaregiverById( request.account?.id! );
		} else {
			console.log( 'Invalid Designation' );
			return response( StatusCodes.UNAUTHORIZED, null, 'Invalid Designation' );
		}

		if ( !user ) {
			console.log( 'No user found' );
			return response( StatusCodes.BAD_REQUEST, null, 'No user found' );
		}

		const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );

		console.log( 'accessToken created successfully', accessToken );

		return response( StatusCodes.OK, { accessToken }, 'Access token has been reset!' );
	};
}
