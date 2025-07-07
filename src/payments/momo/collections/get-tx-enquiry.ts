import axios from 'axios';
import envars from '../../../config/env-vars';
import { momo_sandbox } from '../../../config/urls';

export default async function getTXEnquiry( token: string, referenceId: string ) {
	try {
		const config = {
			method: 'get',
			url: `${momo_sandbox}/collection/v1_0/requesttopay/${referenceId}`,
			headers: {
				'X-Target-Environment': 'sandbox',
				'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
				Authorization: `Bearer ${token}`,
			},
		};

		const response = await axios.request( config );
		console.log( response )

		if ( response.status === 200 ) {
			return response;
		}

		throw new Error( `Transaction enquiry failed with status: ${response.status}` );
	} catch ( error: any ) {
		console.error( 'Transaction enquiry error:', error.response?.data || error.message );
		throw error;
	}
}
