// controllers/get-qualification-document.ts
import { HTTPRequest } from '../../../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { CaregiverRepo } from '../../../../infra/database/repositories/caregiver-repository';
import { response } from '../../../../core/utils/http-response';
import path from 'path';
import fs from 'fs';
import { getMimeType } from '../../../../core/utils/mime-types';

export function getQualificationDocument() {
	return async function ( request: HTTPRequest<{ id: string; documentPath: string }> ) {
		const { id, documentPath } = request.params;
		console.log( 'calling getQualificationDocument' );
		console.log( 'request.account?.id', request.account?.id );
		console.log( 'request.params.id', request.params.id );
		try {
			console.log( 'calling getQualificationDocument' );
			console.log( 'request.account?.id', request.account?.id );
			console.log( 'request.params.id', request.params.id );
			const caregiver = await CaregiverRepo.getCaregiverById( id );
			console.log( 'caregiver', caregiver );

			if ( !caregiver ) {
				console.log( 'Caregiver not found' );
				return response( StatusCodes.OK, null, 'Caregiver not found' );
			}

			// Check if the document belongs to the caregiver
			if ( !caregiver.qualifications.includes( documentPath ) ) {
				console.log( 'Document not found for this caregiver' );
				return response( StatusCodes.FORBIDDEN, null, 'Document not found for this caregiver' );
			}

			const fullPath = path.join( process.cwd(), documentPath );

			// Check if file exists
			if ( !fs.existsSync( fullPath ) ) {
				console.log( 'Document file not found' );
				return response( StatusCodes.OK, null, 'Document file not found' );
			}

			// Return file path and metadata
			const stats = fs.statSync( fullPath );
			console.log( 'stats', stats );
			const fileInfo = {
				path: documentPath,
				fileName: path.basename( documentPath ),
				size: stats.size,
				uploadDate: stats.mtime,
				mimeType: getMimeType( path.extname( documentPath ).toLowerCase() ),
			};
			console.log( 'fileInfo', fileInfo );

			return response( StatusCodes.OK, fileInfo, 'Document info retrieved' );
		} catch ( error ) {
			console.log( 'error', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Error retrieving qualification document'
			);
		}
	};
}
