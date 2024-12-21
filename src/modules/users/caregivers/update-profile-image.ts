import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { response } from '../../../core/utils/http-response';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';

export function updateProfilePicture() {
    return async function ( request: HTTPRequest<{ id: string }, { profileImageUrl: string }, object> ) {
        const { id } = request.params;
        const { profileImageUrl } = request.body;
        const caregiver = await CaregiverRepo.getCaregiverById( id );
        if ( !caregiver ) {
            return response( StatusCodes.NOT_FOUND, null, 'Caregiver not found' );
        }
        caregiver.imgUrl = profileImageUrl;
        await caregiver.save();
        return response( StatusCodes.OK, { caregiver }, 'Profile image updated' );
    }
}
