import { CaregiverRepo } from '../../../../infra/database/repositories/caregiver-repository';
import { HTTPRequest } from '../../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../../core/utils/http-response';

export function getQualifications() {
	return async function ( request: HTTPRequest<{ id: string }, object, object> ) {
		try {
			const { id } = request.params;
			const caregiver = await CaregiverRepo.getCaregiverById( id );

			if ( !caregiver ) {
				return response( StatusCodes.NOT_FOUND, null, 'Caregiver not found' );
			}

			return response( StatusCodes.OK, {
				caregiverId: id,
				qualifications: caregiver.qualifications || []
			}, 'Qualifications Retrieved' );
		} catch ( error ) {
			console.error( 'Fetch qualifications error:', error );
			return response( StatusCodes.INTERNAL_SERVER_ERROR, null, 'Error fetching qualifications' );
		}
	};
}

export function addQualifications() {
	return async function ( request: HTTPRequest<{ id: string }, { qualificationUrls: string[] }, object> ) {
		const { id } = request.params;
		console.log( 'id', id );
		const { qualificationUrls } = request.body;

		console.log( 'qualificationUrls', qualificationUrls );

		const caregiver = await CaregiverRepo.getCaregiverById( id );
		if ( !caregiver ) {
			return response( StatusCodes.NOT_FOUND, null, 'Caregiver not found' );
		}
		const newQualifications = qualificationUrls.filter( ( url ) => !caregiver.qualifications.includes( url ) );
		caregiver.qualifications = [...caregiver.qualifications, ...newQualifications];
		await caregiver.save();
		return response( StatusCodes.OK, { caregiver }, 'Qualifications added' );
	}
}

export function updateQualifications() {
	return async function ( request: HTTPRequest<{ id: string }, { qualificationUrls: string[] }, object> ) {
		const { id } = request.params;
		const { qualificationUrls } = request.body;
		const caregiver = await CaregiverRepo.getCaregiverById( id );
		if ( !caregiver ) {
			return response( StatusCodes.NOT_FOUND, null, 'Caregiver not found' );
		}
		caregiver.qualifications = qualificationUrls;
		await caregiver.save();
		return response( StatusCodes.OK, { caregiver }, 'Qualifications updated' );
	}
}

export function deleteQualification() {
	return async function ( request: HTTPRequest<{ id: string }, object, { qualificationUrl: string }> ) {
		const { id } = request.params;
		const { qualificationUrl } = request.query;
		const caregiver = await CaregiverRepo.getCaregiverById( id );
		if ( !caregiver ) {
			return response( StatusCodes.NOT_FOUND, null, 'Caregiver not found' );
		}
		caregiver.qualifications = caregiver.qualifications.filter( ( url ) => url !== qualificationUrl );
		await caregiver.save();
		return response( StatusCodes.OK, { caregiver }, 'Qualification deleted' );
	}
}
