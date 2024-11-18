// utils/mime-types.ts
export function getMimeType(extension: string): string {
	const mimeTypes: { [key: string]: string } = {
		'.pdf': 'application/pdf',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
	};
	return mimeTypes[extension] || 'application/octet-stream';
}
