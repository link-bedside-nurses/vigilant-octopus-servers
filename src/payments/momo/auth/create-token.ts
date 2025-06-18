import axios from 'axios';
import { momo_sandbox } from '../../../config/base-url';
import envars from '../../../config/env-vars';

interface ApiUserInfo {
	providerCallbackHost: string;
	targetEnvironment: string;
}

export async function getMomoApiUserInfo(referenceId: string): Promise<ApiUserInfo> {
	try {
		const config = {
			method: 'get',
			url: `${momo_sandbox}/v1_0/apiuser/${referenceId}`,
			headers: {
				'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
			},
		};

		const response = await axios.request<ApiUserInfo>(config);

		if (response.status === 200) {
			console.log('API User info retrieved successfully');
			return response.data;
		}

		throw new Error(`Failed to get API user info: ${response.status}`);
	} catch (error: any) {
		console.error('Error getting API user info:', error.response?.data || error.message);
		throw error;
	}
}
