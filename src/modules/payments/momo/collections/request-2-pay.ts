import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { uris, envars } from '../../../../config/constants';

export default async function makeReq2Pay(token: string, amount: string, partyId: string) {
	const xReferenceId = uuidv4();

	const data = {
		amount: amount,
		currency: 'EURO',
		externalId: '097411115',
		payer: {
			partyIdType: 'MSISDN',
			partyId: partyId,
		},
		payerMessage: 'Test payment 2',
		payeeNote: 'Test payment Note 2',
	};

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${uris.momo_sandbox}/collection/v1_0/requesttopay`,
		headers: {
			'X-Reference-Id': xReferenceId,
			'X-Target-Environment': 'sandbox',
			'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
			Authorization: `Bearer ${token}`,
		},
		data: data,
	};

	return await axios.request(config);
}
