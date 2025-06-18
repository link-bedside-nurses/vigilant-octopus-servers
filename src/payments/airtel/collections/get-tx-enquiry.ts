import axios from 'axios';
import { airtel } from '../../../config/base-url';

export default async function getTXEnquiry(id: string, bearer: string) {
	const config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `${airtel}/standard/v1/payments/${id}`,
		headers: {
			'Content-Type': 'application/json',
			Accept: '*/*',
			'X-Country': 'UG',
			'X-Currency': 'UGX',
			Authorization: `Bearer ${bearer}`,
			Cookie:
				'visid_incap_2967769=x+0O2DxzRu+kAN3M8iwXEEQjV2UAAAAAQUIPAAAAAACQZlONmE25iPK70yNTOqwi',
		},
		data: '',
	};

	return await axios.request(config);
}
