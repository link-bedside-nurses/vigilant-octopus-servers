import createAirtelMoneyBearerToken from './create-token';

export class AirtelAuthService {
    private static instance: AirtelAuthService;
    private token?: string;
    private tokenExpiry?: Date;

    private constructor() { }

    public static getInstance(): AirtelAuthService {
        if ( !AirtelAuthService.instance ) {
            AirtelAuthService.instance = new AirtelAuthService();
        }
        return AirtelAuthService.instance;
    }

    public async getToken(): Promise<string | undefined> {
        try {
            if ( this.token && this.tokenExpiry && this.tokenExpiry > new Date() ) {
                return this.token;
            }

            const response = await createAirtelMoneyBearerToken();

            if ( response.status === 200 && response.data.access_token ) {
                this.token = response.data.access_token;
                // Set token expiry to slightly less than actual expiry time
                this.tokenExpiry = new Date( Date.now() + ( response.data.expires_in * 1000 ) - 60000 );
                return this.token;
            }

            throw new Error( 'Failed to get Airtel Money token' );
        } catch ( error ) {
            console.error( 'Error getting Airtel Money token:', error );
            throw error;
        }
    }
}
