import axios from 'axios';
import { uris, envars } from '../../../../config/constants';

export default function createMomoBearerToken() {
	const data = '';

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${uris.momo_sandbox}/v1_0/apiuser/${envars.X_REFERENCE_ID}/${envars.API_KEY}`,
		headers: {
			'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
		},
		data: data,
	};

	return axios.request(config);
}
