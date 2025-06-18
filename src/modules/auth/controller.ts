import { HTTPRequest } from '../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../utils/http-response';
import { NurseRepo } from '../../database/repositories/nurse-repository';
import { PatientRepo } from '../../database/repositories/patient-repository';

export function requestAccountDeletion() {
	return async function ( request: HTTPRequest<object, { email: string }, object> ) {
		const { email } = request.body;

		if ( !email ) {
			return response( StatusCodes.BAD_REQUEST, null, 'Email is required' );
		}

		try {
			// Check if user exists as patient
			const patient = await PatientRepo.getPatientByEmail( email );

			// Check if user exists as nurse
			const nurse = await NurseRepo.getNurseByEmail( email );

			if ( !patient && !nurse ) {
				return response( StatusCodes.NOT_FOUND, null, 'No account found with this email' );
			}

			// Process deletion based on account type
			if ( patient ) {
				await PatientRepo.markPatientForDeletion( patient._id.toString() );
			}

			if ( nurse ) {
				await NurseRepo.markNurseForDeletion( nurse._id.toString() );
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

			if ( !accountId ) {
				return response( StatusCodes.UNAUTHORIZED, null, 'User not authenticated' );
			}

			await PatientRepo.deletePatient( accountId );

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
