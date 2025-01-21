import axios from 'axios';
import { uris, envars } from '../../../../../config/constants';

interface RequestToPayPayload {
	amount: string;
	currency: string;
	externalId: string;
	payer: {
		partyIdType: 'MSISDN';
		partyId: string;
	};
	payerMessage: string;
	payeeNote: string;
}

export default async function makeReq2Pay(
	token: string,
	referenceId: string,
	payload: RequestToPayPayload
) {
	try {
		const config = {
			method: 'post',
			url: `${uris.momo_sandbox}/collection/v1_0/requesttopay`,
			headers: {
				'X-Reference-Id': referenceId,
				'X-Target-Environment': 'sandbox',
				'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			data: payload
		};

		const response = await axios.request( config );

		if ( response.status === 202 ) {
			console.log( 'Payment request accepted' );
			return response;
		}

		throw new Error( `Request to pay failed with status: ${response.status}` );
	} catch ( error: any ) {
		console.error( 'Request to pay error:', error.response?.data || error.message );
		throw error;
	}
}
