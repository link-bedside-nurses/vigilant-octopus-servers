import { uris } from '@/constants';
import axios from 'axios';
import { v4 as uuid4 } from 'uuid';

export default async function makeReq2Pay( token: string, msisdn: string, amount: number ) {

    const id = uuid4()

    const data = JSON.stringify( {
        "reference": `${amount} from ${msisdn}`,
        "subscriber": {
            "country": "UG",
            "currency": "UGX",
            "msisdn": msisdn
        },
        "transaction": {
            "amount": amount,
            "country": "UG",
            "currency": "UGX",
            "id": id
        }
    } );

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${uris.airtel}/merchant/v1/payments`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Country': 'UG',
            'Authorization': `Bearer ${token}`,
            'Cookie': 'visid_incap_2967769=x+0O2DxzRu+kAN3M8iwXEEQjV2UAAAAAQUIPAAAAAACQZlONmE25iPK70yNTOqwi'
        },
        data: data
    };

    return await axios.request( config )
}
