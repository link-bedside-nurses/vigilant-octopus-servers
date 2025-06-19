import axios from 'axios';
import envars from '../../../config/env-vars';
import { momo_sandbox } from '../../../config/urls';
import logger from '../../../utils/logger';

interface ApiKeyResponse {
	apiKey: string;
}

export async function createMomoApiKey(referenceId: string): Promise<string> {
	try {
		const config = {
			method: 'post',
			url: `${momo_sandbox}/v1_0/apiuser/${referenceId}/apikey`,
			headers: {
				'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
			},
		};

		const response = await axios.request<ApiKeyResponse>(config);

		if (response.status === 201 && response.data.apiKey) {
			logger.info('API Key generated successfully');
			return response.data.apiKey;
		}

		throw new Error('Failed to get API key from response');
	} catch (error: any) {
		console.error('Error generating API key:', error.response?.data || error.message);
		throw error;
	}
}
