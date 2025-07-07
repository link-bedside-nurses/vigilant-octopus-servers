import axios from 'axios';
import envars from '../../../config/env-vars';
import { momo_sandbox } from '../../../config/urls';
import logger from '../../../utils/logger';
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
			url: `${momo_sandbox}/collection/v1_0/requesttopay`,
			headers: {
				'X-Reference-Id': referenceId,
				'X-Target-Environment': 'sandbox',
				'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			data: payload,
		};

		const response = await axios.request( config );
		console.log( response )

		if ( response.status === 202 ) {
			logger.info( 'Payment request accepted' );
			return response;
		}

		throw new Error( `Request to pay failed with status: ${response.status}` );
	} catch ( error: any ) {
		console.error( 'Request to pay error:', error.response?.data || error.message );
		throw error;
	}
}
