import { AirtelAuthService } from '../auth/airtel-auth-service';
import makeReq2Pay from './request-2-pay';
import getTXEnquiry from './get-tx-enquiry';

interface TransactionStatus {
    status: string;
    message: string;
    transactionId?: string;
    data?: any;
}

export class AirtelCollectionsService {
    private static instance: AirtelCollectionsService;
    private airtelAuth: AirtelAuthService;

    private constructor() {
        this.airtelAuth = AirtelAuthService.getInstance();
    }

    public static getInstance(): AirtelCollectionsService {
        if ( !AirtelCollectionsService.instance ) {
            AirtelCollectionsService.instance = new AirtelCollectionsService();
        }
        return AirtelCollectionsService.instance;
    }

    public async requestToPay( amount: number, phoneNumber: string ): Promise<string> {
        try {
            const token = await this.airtelAuth.getToken();
            if ( !token ) {
                throw new Error( 'Failed to get Airtel Money token' );
            }
            const response = await makeReq2Pay( token, phoneNumber, amount );

            if ( response.status === 202 ) {
                return response.data.transaction.id;
            }

            throw new Error( `Airtel Money payment request failed: ${response.status}` );
        } catch ( error: any ) {
            console.error( 'Airtel Money payment request failed:', error );
            throw error;
        }
    }

    public async getTransactionStatus( transactionId: string ): Promise<TransactionStatus> {
        try {
            const token = await this.airtelAuth.getToken();
            if ( !token ) {
                throw new Error( 'Failed to get Airtel Money token' );
            }
            const response = await getTXEnquiry( transactionId, token );

            if ( response.status === 200 ) {
                return {
                    status: response.data.status,
                    message: response.data.message,
                    transactionId: response.data.transaction?.id,
                    data: response.data
                };
            }

            throw new Error( `Failed to get transaction status: ${response.status}` );
        } catch ( error: any ) {
            console.error( 'Get transaction status failed:', error );
            throw error;
        }
    }
}
