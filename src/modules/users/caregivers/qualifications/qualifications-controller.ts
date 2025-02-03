import { CaregiverRepo } from '../../../../infra/database/repositories/caregiver-repository';
import { HTTPRequest } from '../../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../../core/utils/http-response';

export function getQualifications() {
	return async function ( request: HTTPRequest<{ id: string }, object, object> ) {
		console.log( 'calling getQualifications' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		try {
			const { id } = request.params;
			const caregiver = await CaregiverRepo.getCaregiverById( id );
			console.log( 'caregiver', caregiver );
			if ( !caregiver ) {
				console.log( 'Caregiver not found' );
				return response( StatusCodes.OK, null, 'Caregiver not found' );
			}
			console.log( 'caregiver.qualifications', caregiver.qualifications );
			return response( StatusCodes.OK, {
				caregiverId: id,
				qualifications: caregiver.qualifications || [],
			}, 'Qualifications Retrieved' );
		} catch ( error ) {
			console.error( 'Fetch qualifications error:', error );
			return response( StatusCodes.INTERNAL_SERVER_ERROR, null, 'Error fetching qualifications' );
		}
	};
}

export function addQualifications() {
	return async function ( request: HTTPRequest<{ id: string }, { qualificationUrls: string[] }, object> ) {
		console.log( 'calling addQualifications' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const { id } = request.params;
		console.log( 'id', id );
		const { qualificationUrls } = request.body;
		console.log( 'qualificationUrls', qualificationUrls );

		const caregiver = await CaregiverRepo.getCaregiverById( id );
		if ( !caregiver ) {
			console.log( 'Caregiver not found' );
			return response( StatusCodes.OK, null, 'Caregiver not found' );
		}
		const newQualifications = qualificationUrls.filter( ( url ) => !caregiver.qualifications.includes( url ) );
		console.log( 'newQualifications', newQualifications );
		caregiver.qualifications = [...caregiver.qualifications, ...newQualifications];
		await caregiver.save();
		console.log( 'caregiver', caregiver );
		return response( StatusCodes.OK, { caregiver }, 'Qualifications added' );
	}
}

export function updateQualifications() {
	return async function ( request: HTTPRequest<{ id: string }, { qualificationUrls: string[] }, object> ) {
		console.log( 'calling updateQualifications' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const { id } = request.params;
		const { qualificationUrls } = request.body;
		console.log( 'qualificationUrls', qualificationUrls );
		const caregiver = await CaregiverRepo.getCaregiverById( id );
		if ( !caregiver ) {
			console.log( 'Caregiver not found' );
			return response( StatusCodes.OK, null, 'Caregiver not found' );
		}
		caregiver.qualifications = qualificationUrls;
		await caregiver.save();
		console.log( 'caregiver', caregiver );
		return response( StatusCodes.OK, { caregiver }, 'Qualifications updated' );
	}
}

export function deleteQualification() {
	return async function ( request: HTTPRequest<{ id: string }, object, { qualificationUrl: string }> ) {
		console.log( 'calling deleteQualification' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		const { id } = request.params;
		const { qualificationUrl } = request.query;
		console.log( 'qualificationUrl', qualificationUrl );
		const caregiver = await CaregiverRepo.getCaregiverById( id );
		if ( !caregiver ) {
			console.log( 'Caregiver not found' );
			return response( StatusCodes.OK, null, 'Caregiver not found' );
		}
		caregiver.qualifications = caregiver.qualifications.filter( ( url ) => url !== qualificationUrl );
		await caregiver.save();
		console.log( 'caregiver', caregiver );
		return response( StatusCodes.OK, { caregiver }, 'Qualification deleted' );
	}
}
