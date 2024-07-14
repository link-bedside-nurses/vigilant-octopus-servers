import axios from 'axios';
import { envars, uris } from '../../../../config/constants';

export default async function createMomoBearerToken() {
	const config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${uris.momo_sandbox}/v1_0/apiuser/${envars.X_REFERENCE_ID}`,
		headers: {
			'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
		},
	};

	return await axios.request(config);
}
