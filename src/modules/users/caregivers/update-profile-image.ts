import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { response } from '../../../core/utils/http-response';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';

export function updateProfilePicture() {
    return async function ( request: HTTPRequest<{ id: string }, { profileImageUrl: string }, object> ) {
        console.log( 'calling updateProfilePicture' );
        console.log( 'request.params.id', request.params.id );
        console.log( 'request.body', request.body );
        const { id } = request.params;
        const { profileImageUrl } = request.body;
        console.log( 'id', id );
        console.log( 'profileImageUrl', profileImageUrl );
        const caregiver = await CaregiverRepo.getCaregiverById( id );
        console.log( 'caregiver', caregiver );
        if ( !caregiver ) {
            return response( StatusCodes.NOT_FOUND, null, 'Caregiver not found' );
        }
        caregiver.imgUrl = profileImageUrl;
        await caregiver.save();
        console.log( 'caregiver updated' );
        return response( StatusCodes.OK, { caregiver }, 'Profile image updated' );
    };
}
