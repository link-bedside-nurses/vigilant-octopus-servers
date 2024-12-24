import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { CreatePatientDto, CreatePatientSchema } from '../../../core/interfaces/dtos';
import { response } from '../../../core/utils/http-response';
import startPhoneVerification from '../../../core/utils/startPhoneVerification';
import { PatientRepo } from '../../../infra/database/repositories/patient-repository';

export function patientSignin() {
	return async function ( request: HTTPRequest<object, Pick<CreatePatientDto, 'phone'>> ) {
		const result = CreatePatientSchema.pick( { phone: true } ).safeParse( request.body );

		console.log( 'imcoming data', request.body )
		if ( !result.success ) {
			console.log( 'validation failed at signin ', result.error )
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}
		console.log( 'result', result );

		const user = await PatientRepo.getPatientByPhone( result.data.phone );

		console.log( 'user', user );

		if ( !user ) {
			console.log( 'No such user found' );
			return response( StatusCodes.UNAUTHORIZED, null, 'No such user found'
			);
		}

		await startPhoneVerification( result.data.phone );
		console.log( 'OTP sent successfully to phone number', result.data.phone );

		return response( StatusCodes.OK, null, 'Check sms for Cne Time Code (OTP)' );
	};
}
