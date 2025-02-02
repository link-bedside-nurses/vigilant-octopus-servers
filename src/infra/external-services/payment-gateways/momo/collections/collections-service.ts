import { v4 as uuidv4 } from 'uuid';
import { MomoAuthService } from '../auth/momo-auth-service';
import makeReq2Pay from './request-2-pay';
import getTXEnquiry from './get-tx-enquiry';

interface RequestToPayResult {
    amount: string;
    currency: string;
    financialTransactionId?: string;
    externalId: string;
    payer: {
        partyIdType: 'MSISDN';
        partyId: string;
    };
    payerMessage?: string;
    payeeNote?: string;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    reason?: {
        code: string;
        message: string;
    };
}

export class MomoCollectionsService {
    private static instance: MomoCollectionsService;
    private momoAuth: MomoAuthService;

    private constructor() {
        this.momoAuth = MomoAuthService.getInstance();
    }

    public static getInstance(): MomoCollectionsService {
        if ( !MomoCollectionsService.instance ) {
            MomoCollectionsService.instance = new MomoCollectionsService();
        }
        return MomoCollectionsService.instance;
    }

    public async requestToPay( amount: string, phoneNumber: string, message: string ): Promise<string> {
        try {
            const referenceId = uuidv4();
            const token = this.momoAuth.getApiKey();

            await makeReq2Pay( token, referenceId, {
                amount,
                currency: 'UGX',
                externalId: referenceId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phoneNumber
                },
                payerMessage: message,
                payeeNote: `Payment request for ${amount} UGX`
            } );

            return referenceId;
        } catch ( error: any ) {
            console.error( 'Request to pay failed:', error.response?.data || error.message );
            throw error;
        }
    }

    public async getTransactionStatus( referenceId: string ): Promise<RequestToPayResult> {
        try {
            const token = this.momoAuth.getApiKey();
            const response = await getTXEnquiry( token, referenceId );

            if ( response.status === 200 ) {
                return response.data;
            }

            throw new Error( `Failed to get transaction status: ${response.status}` );
        } catch ( error: any ) {
            console.error( 'Get transaction status failed:', error.response?.data || error.message );
            throw error;
        }
    }
}
