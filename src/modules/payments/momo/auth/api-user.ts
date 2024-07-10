import axios from 'axios';
import { uris, EnvironmentVars } from '../../../../config/constants';

export default async function createMomoAPIUSER() {
	const data = JSON.stringify({
		providerCallbackHost: 'https://webhook.site/de55348f-c6e2-4518-bc48-1661f1efeec9',
	});

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${uris.momo_sandbox}/v1_0/apiuser`,
		headers: {
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key': EnvironmentVars.getOcpApimSubscriptionKey(),
			'X-Reference-Id': EnvironmentVars.getXReferenceId(),
		},
		data,
	};

	return await axios.request(config);
}
