import axios, { AxiosResponse } from 'axios';
import envars from '../../../config/env-vars';
import { momo_sandbox } from '../../../config/urls';
import logger from '../../../utils/logger';

interface ApiUserResponse {
	providerCallbackHost: string;
	targetEnvironment: string;
}

export async function createMomoAPIUser(
	referenceId: string,
	callbackHost: string
): Promise<AxiosResponse> {
	try {
		const data = {
			providerCallbackHost: callbackHost,
		};

		const config = {
			method: 'post',
			url: `${momo_sandbox}/v1_0/apiuser`,
			headers: {
				'Content-Type': 'Application/json',
				'X-Reference-Id': referenceId,
				'Ocp-Apim-Subscription-Key': envars.OCP_APIM_SUBSCRIPTION_KEY,
			},
			data,
		};

		const response = await axios.request<ApiUserResponse>( config );

		if ( response.status === 201 ) {
			logger.info( 'API User created successfully' );
			return response;
		}

		throw new Error( `Failed to create API user: ${response.status}` );
	} catch ( error: any ) {
		console.error( 'Error creating API user:', error.response?.data || error.message );
		throw error;
	}
}
