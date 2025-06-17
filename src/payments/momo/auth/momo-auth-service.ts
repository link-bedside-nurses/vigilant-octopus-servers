import { v4 as uuidv4 } from 'uuid';
import { createMomoAPIUser } from './api-user';
import { createMomoApiKey } from './api-key';
import { getMomoApiUserInfo } from './create-token';

export class MomoAuthService {
    private static instance: MomoAuthService;
    private apiKey?: string;
    private referenceId: string;

    private constructor() {
        this.referenceId = uuidv4();
    }

    public static getInstance(): MomoAuthService {
        if ( !MomoAuthService.instance ) {
            MomoAuthService.instance = new MomoAuthService();
        }
        return MomoAuthService.instance;
    }

    public async initialize( callbackHost: string ): Promise<void> {
        try {
            // Step 1: Create API User
            await createMomoAPIUser( this.referenceId, callbackHost );

            // Step 2: Generate API Key
            this.apiKey = await createMomoApiKey( this.referenceId );

            // Step 3: Verify API User creation
            await getMomoApiUserInfo( this.referenceId );

            console.log( 'MOMO API User initialized successfully' );
        } catch ( error ) {
            console.error( 'Failed to initialize MOMO API User:', error );
            throw error;
        }
    }

    public getApiKey(): string {
        if ( !this.apiKey ) {
            throw new Error( 'API Key not initialized. Call initialize() first.' );
        }
        return this.apiKey;
    }

    public getReferenceId(): string {
        return this.referenceId;
    }
}
