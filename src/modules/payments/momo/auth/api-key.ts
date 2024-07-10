import axios from 'axios';
import { uris, EnvironmentVars } from '../../../../config/constants';

export default function createMomoBearerToken() {
	const data = '';

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${
			uris.momo_sandbox
		}/v1_0/apiuser/${EnvironmentVars.getXReferenceId()}/${EnvironmentVars.getApiKey()}`,
		headers: {
			'Ocp-Apim-Subscription-Key': EnvironmentVars.getOcpApimSubscriptionKey(),
		},
		data: data,
	};

	return axios.request(config);
}
