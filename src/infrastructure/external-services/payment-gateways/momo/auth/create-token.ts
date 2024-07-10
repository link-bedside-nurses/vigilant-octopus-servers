import axios from 'axios';
import { uris, EnvironmentVars } from '../../../../../config/constants';

export default async function createMomoBearerToken() {
	const config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${uris.momo_sandbox}/v1_0/apiuser/${EnvironmentVars.getXReferenceId()}`,
		headers: {
			'Ocp-Apim-Subscription-Key': EnvironmentVars.getOcpApimSubscriptionKey(),
		},
	};

	return await axios.request(config);
}
