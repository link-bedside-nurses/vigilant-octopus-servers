import axios from 'axios';
import { envars, uris } from '../../../../../config/constants';

export default async function createAirteMoneyBearerToken() {
	const data = JSON.stringify({
		client_id: envars.AIRTEL_MONEY_CLIENT_ID,
		client_secret: envars.AIRTEL_MONEY_CLIENT_SECRET_KEY,
		grant_type: 'client_credentials',
	});

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${uris.airtel}/auth/oauth2/token`,
		headers: {
			'Content-Type': 'application/json',
		},
		data: data,
	};

	return await axios.request(config);
}
