import axios from 'axios';
import { uris, envars } from '../../../../config/constants';

export default async function getTXEnquiry(token: string, id: string) {
	const config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${uris.momo_sandbox}/collection/v1_0/requesttopay/${id}`,
		headers: {
			'X-Target-Environment': 'sandbox',
			'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
			'X-Reference-Id': id,
			Authorization: `Bearer ${token}`,
		},
	};

	return await axios.request(config);
}
