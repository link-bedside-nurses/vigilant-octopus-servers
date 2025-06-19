/**
 * Ugandan Mobile Network Provider Detection
 *
 * This function detects the mobile network provider based on Ugandan phone number prefixes.
 * It handles various formats including international, national, and local formats.
 */

export type UgandanProvider = 'MTN' | 'AIRTEL' | 'UNKNOWN';

export interface ProviderInfo {
	provider: UgandanProvider;
	confidence: 'HIGH' | 'MEDIUM' | 'LOW';
	formattedNumber?: string;
	originalNumber: string;
	reason?: string;
}

// Comprehensive list of Ugandan mobile prefixes
const UGANDA_PREFIXES = {
	MTN: [
		// MTN Uganda prefixes: 76X, 77X, 78X, 79X
		'760',
		'761',
		'762',
		'763',
		'764',
		'765',
		'766',
		'767',
		'768',
		'769',
		'770',
		'771',
		'772',
		'773',
		'774',
		'775',
		'776',
		'777',
		'778',
		'779',
		'780',
		'781',
		'782',
		'783',
		'784',
		'785',
		'786',
		'787',
		'788',
		'789',
		'790',
		'791',
		'792',
		'793',
		'794',
		'795',
		'796',
		'797',
		'798',
		'799',
		// International format (256)
		'256760',
		'256761',
		'256762',
		'256763',
		'256764',
		'256765',
		'256766',
		'256767',
		'256768',
		'256769',
		'256770',
		'256771',
		'256772',
		'256773',
		'256774',
		'256775',
		'256776',
		'256777',
		'256778',
		'256779',
		'256780',
		'256781',
		'256782',
		'256783',
		'256784',
		'256785',
		'256786',
		'256787',
		'256788',
		'256789',
		'256790',
		'256791',
		'256792',
		'256793',
		'256794',
		'256795',
		'256796',
		'256797',
		'256798',
		'256799',
	],
	AIRTEL: [
		// Airtel Uganda prefixes: 70X, 74X, 75X
		'700',
		'701',
		'702',
		'703',
		'704',
		'705',
		'706',
		'707',
		'708',
		'709',
		'740',
		'741',
		'742',
		'743',
		'744',
		'745',
		'746',
		'747',
		'748',
		'749',
		'750',
		'751',
		'752',
		'753',
		'754',
		'755',
		'756',
		'757',
		'758',
		'759',
		// International format (256)
		'256700',
		'256701',
		'256702',
		'256703',
		'256704',
		'256705',
		'256706',
		'256707',
		'256708',
		'256709',
		'256740',
		'256741',
		'256742',
		'256743',
		'256744',
		'256745',
		'256746',
		'256747',
		'256748',
		'256749',
		'256750',
		'256751',
		'256752',
		'256753',
		'256754',
		'256755',
		'256756',
		'256757',
		'256758',
		'256759',
	],
};

// Known invalid or reserved prefixes
const INVALID_PREFIXES = [
	'000',
	'001',
	'002',
	'003',
	'004',
	'005',
	'006',
	'007',
	'008',
	'009',
	'010',
	'011',
	'012',
	'013',
	'014',
	'015',
	'016',
	'017',
	'018',
	'019',
	'020',
	'021',
	'022',
	'023',
	'024',
	'025',
	'026',
	'027',
	'028',
	'029',
	'030',
	'031',
	'032',
	'033',
	'034',
	'035',
	'036',
	'037',
	'038',
	'039',
	'040',
	'041',
	'042',
	'043',
	'044',
	'045',
	'046',
	'047',
	'048',
	'049',
	'050',
	'051',
	'052',
	'053',
	'054',
	'055',
	'056',
	'057',
	'058',
	'059',
	'060',
	'061',
	'062',
	'063',
	'064',
	'065',
	'066',
	'067',
	'068',
	'069',
	'080',
	'081',
	'082',
	'083',
	'084',
	'085',
	'086',
	'087',
	'088',
	'089',
	'090',
	'091',
	'092',
	'093',
	'094',
	'095',
	'096',
	'097',
	'098',
	'099',
];

/**
 * Clean and normalize phone number
 */
function normalizePhoneNumber(phone: string): string {
	if (!phone || typeof phone !== 'string') {
		return '';
	}

	// Remove all non-digit characters
	let cleaned = phone.replace(/\D/g, '');

	// Handle international format with +256
	if (cleaned.startsWith('256')) {
		// Already in international format, keep as is
	} else if (cleaned.startsWith('0')) {
		// Convert national format to international
		cleaned = '256' + cleaned.substring(1);
	} else if (cleaned.length === 9) {
		// Assume it's a local number without country code
		cleaned = '256' + cleaned;
	}

	return cleaned;
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone: string): { isValid: boolean; reason?: string } {
	const normalized = normalizePhoneNumber(phone);

	// Check if empty
	if (!normalized) {
		return { isValid: false, reason: 'Empty or invalid phone number' };
	}

	// Check if it starts with 256 (Uganda country code)
	if (!normalized.startsWith('256')) {
		return { isValid: false, reason: 'Not a Ugandan phone number (should start with 256)' };
	}

	// Check length (256 + 9 digits = 12 characters)
	if (normalized.length !== 12) {
		return { isValid: false, reason: `Invalid length: ${normalized.length} digits (expected 12)` };
	}

	// Check if it's a known invalid prefix
	const prefix = normalized.substring(3, 6); // Get the 3-digit prefix after 256
	if (INVALID_PREFIXES.includes(prefix)) {
		return { isValid: false, reason: `Invalid prefix: ${prefix}` };
	}

	return { isValid: true };
}

/**
 * Detect provider with confidence level
 */
function detectProviderWithConfidence(phone: string): ProviderInfo {
	const originalNumber = phone;
	const normalized = normalizePhoneNumber(phone);
	const validation = validatePhoneNumber(phone);

	if (!validation.isValid) {
		return {
			provider: 'UNKNOWN',
			confidence: 'LOW',
			originalNumber,
			reason: validation.reason,
		};
	}

	// Extract the number part after country code
	const numberPart = normalized.substring(3);

	// Check MTN prefixes (high confidence)
	for (const prefix of UGANDA_PREFIXES.MTN) {
		if (numberPart.startsWith(prefix)) {
			return {
				provider: 'MTN',
				confidence: 'HIGH',
				formattedNumber: normalized,
				originalNumber,
			};
		}
	}

	// Check Airtel prefixes (high confidence)
	for (const prefix of UGANDA_PREFIXES.AIRTEL) {
		if (numberPart.startsWith(prefix)) {
			return {
				provider: 'AIRTEL',
				confidence: 'HIGH',
				formattedNumber: normalized,
				originalNumber,
			};
		}
	}

	// Medium confidence checks for partial matches
	const firstThree = numberPart.substring(0, 3);

	// Check if it starts with known MTN patterns (76X, 77X, 78X, 79X)
	if (
		[
			'760',
			'761',
			'762',
			'763',
			'764',
			'765',
			'766',
			'767',
			'768',
			'769',
			'770',
			'771',
			'772',
			'773',
			'774',
			'775',
			'776',
			'777',
			'778',
			'779',
			'780',
			'781',
			'782',
			'783',
			'784',
			'785',
			'786',
			'787',
			'788',
			'789',
			'790',
			'791',
			'792',
			'793',
			'794',
			'795',
			'796',
			'797',
			'798',
			'799',
		].includes(firstThree)
	) {
		return {
			provider: 'MTN',
			confidence: 'MEDIUM',
			formattedNumber: normalized,
			originalNumber,
			reason: `Partial match with MTN prefix pattern: ${firstThree}`,
		};
	}

	// Check if it starts with known Airtel patterns (70X, 74X, 75X)
	if (
		[
			'700',
			'701',
			'702',
			'703',
			'704',
			'705',
			'706',
			'707',
			'708',
			'709',
			'740',
			'741',
			'742',
			'743',
			'744',
			'745',
			'746',
			'747',
			'748',
			'749',
			'750',
			'751',
			'752',
			'753',
			'754',
			'755',
			'756',
			'757',
			'758',
			'759',
		].includes(firstThree)
	) {
		return {
			provider: 'AIRTEL',
			confidence: 'MEDIUM',
			formattedNumber: normalized,
			originalNumber,
			reason: `Partial match with Airtel prefix pattern: ${firstThree}`,
		};
	}

	// Low confidence - unknown pattern
	return {
		provider: 'UNKNOWN',
		confidence: 'LOW',
		formattedNumber: normalized,
		originalNumber,
		reason: `Unknown prefix pattern: ${firstThree}`,
	};
}

/**
 * Main provider detection function (backward compatible)
 */
export default function detectProvider(phone: string): 'MTN' | 'AIRTEL' {
	const result = detectProviderWithConfidence(phone);

	if (result.provider === 'UNKNOWN') {
		throw new Error(`Unsupported phone number prefix: ${result.reason || 'Unknown pattern'}`);
	}

	return result.provider;
}

/**
 * Enhanced provider detection with detailed information
 */
export function detectProviderEnhanced(phone: string): ProviderInfo {
	return detectProviderWithConfidence(phone);
}

/**
 * Validate and format Ugandan phone number
 */
export function formatUgandanPhone(phone: string): {
	formatted: string;
	isValid: boolean;
	error?: string;
} {
	const normalized = normalizePhoneNumber(phone);
	const validation = validatePhoneNumber(phone);

	if (!validation.isValid) {
		return {
			formatted: phone,
			isValid: false,
			error: validation.reason,
		};
	}

	// Format as +256 XXX XXX XXX
	const formatted = `+${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6, 9)} ${normalized.substring(9)}`;

	return {
		formatted,
		isValid: true,
	};
}

/**
 * Get all known prefixes for a provider
 */
export function getProviderPrefixes(provider: 'MTN' | 'AIRTEL'): string[] {
	return UGANDA_PREFIXES[provider];
}

/**
 * Check if a number is likely a Ugandan mobile number
 */
export function isUgandanMobileNumber(phone: string): boolean {
	const validation = validatePhoneNumber(phone);
	return validation.isValid;
}

// const result1 = detectProviderWithConfidence('256787444814');
// const result2 = detectProviderWithConfidence('256756008970');
// logger.info('result1: ', result1);
// logger.info('result2: ', result2);
