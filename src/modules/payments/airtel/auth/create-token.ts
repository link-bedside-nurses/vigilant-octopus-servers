import { EnvironmentVars, uris } from '../../../../constants';
import axios from 'axios';

export default async function createAirteMoneyBearerToken() {

    const data = JSON.stringify( {
        "client_id": EnvironmentVars.getAirtelMoneyClientId(),
        "client_secret": EnvironmentVars.getAirtelMoneyClientSecretKey(),
        "grant_type": "client_credentials"
    } );

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${uris.airtel}/auth/oauth2/token`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    return await axios.request( config )

}
