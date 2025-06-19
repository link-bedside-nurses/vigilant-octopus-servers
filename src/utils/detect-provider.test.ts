/**
 * Test file for Ugandan Provider Detection
 * This demonstrates the comprehensive provider detection capabilities
 */

import logger from '../utils/logger';
import detectProvider, {
	detectProviderEnhanced,
	formatUgandanPhone,
	getProviderPrefixes,
	isUgandanMobileNumber,
} from './detect-provider';

// Test cases for different phone number formats
const testCases = [
	// MTN Numbers (76X, 77X, 78X, 79X)
	{ number: '7601234567', expected: 'MTN', description: 'MTN 760 format' },
	{ number: '7611234567', expected: 'MTN', description: 'MTN 761 format' },
	{ number: '7621234567', expected: 'MTN', description: 'MTN 762 format' },
	{ number: '7631234567', expected: 'MTN', description: 'MTN 763 format' },
	{ number: '7641234567', expected: 'MTN', description: 'MTN 764 format' },
	{ number: '7651234567', expected: 'MTN', description: 'MTN 765 format' },
	{ number: '7661234567', expected: 'MTN', description: 'MTN 766 format' },
	{ number: '7671234567', expected: 'MTN', description: 'MTN 767 format' },
	{ number: '7681234567', expected: 'MTN', description: 'MTN 768 format' },
	{ number: '7691234567', expected: 'MTN', description: 'MTN 769 format' },
	{ number: '7701234567', expected: 'MTN', description: 'MTN 770 format' },
	{ number: '7711234567', expected: 'MTN', description: 'MTN 771 format' },
	{ number: '7721234567', expected: 'MTN', description: 'MTN 772 format' },
	{ number: '7731234567', expected: 'MTN', description: 'MTN 773 format' },
	{ number: '7741234567', expected: 'MTN', description: 'MTN 774 format' },
	{ number: '7751234567', expected: 'MTN', description: 'MTN 775 format' },
	{ number: '7761234567', expected: 'MTN', description: 'MTN 776 format' },
	{ number: '7771234567', expected: 'MTN', description: 'MTN 777 format' },
	{ number: '7781234567', expected: 'MTN', description: 'MTN 778 format' },
	{ number: '7791234567', expected: 'MTN', description: 'MTN 779 format' },
	{ number: '7801234567', expected: 'MTN', description: 'MTN 780 format' },
	{ number: '7811234567', expected: 'MTN', description: 'MTN 781 format' },
	{ number: '7821234567', expected: 'MTN', description: 'MTN 782 format' },
	{ number: '7831234567', expected: 'MTN', description: 'MTN 783 format' },
	{ number: '7841234567', expected: 'MTN', description: 'MTN 784 format' },
	{ number: '7851234567', expected: 'MTN', description: 'MTN 785 format' },
	{ number: '7861234567', expected: 'MTN', description: 'MTN 786 format' },
	{ number: '7871234567', expected: 'MTN', description: 'MTN 787 format' },
	{ number: '7881234567', expected: 'MTN', description: 'MTN 788 format' },
	{ number: '7891234567', expected: 'MTN', description: 'MTN 789 format' },
	{ number: '7901234567', expected: 'MTN', description: 'MTN 790 format' },
	{ number: '7911234567', expected: 'MTN', description: 'MTN 791 format' },
	{ number: '7921234567', expected: 'MTN', description: 'MTN 792 format' },
	{ number: '7931234567', expected: 'MTN', description: 'MTN 793 format' },
	{ number: '7941234567', expected: 'MTN', description: 'MTN 794 format' },
	{ number: '7951234567', expected: 'MTN', description: 'MTN 795 format' },
	{ number: '7961234567', expected: 'MTN', description: 'MTN 796 format' },
	{ number: '7971234567', expected: 'MTN', description: 'MTN 797 format' },
	{ number: '7981234567', expected: 'MTN', description: 'MTN 798 format' },
	{ number: '7991234567', expected: 'MTN', description: 'MTN 799 format' },

	// Airtel Numbers (70X, 74X, 75X)
	{ number: '7001234567', expected: 'AIRTEL', description: 'Airtel 700 format' },
	{ number: '7011234567', expected: 'AIRTEL', description: 'Airtel 701 format' },
	{ number: '7021234567', expected: 'AIRTEL', description: 'Airtel 702 format' },
	{ number: '7031234567', expected: 'AIRTEL', description: 'Airtel 703 format' },
	{ number: '7041234567', expected: 'AIRTEL', description: 'Airtel 704 format' },
	{ number: '7051234567', expected: 'AIRTEL', description: 'Airtel 705 format' },
	{ number: '7061234567', expected: 'AIRTEL', description: 'Airtel 706 format' },
	{ number: '7071234567', expected: 'AIRTEL', description: 'Airtel 707 format' },
	{ number: '7081234567', expected: 'AIRTEL', description: 'Airtel 708 format' },
	{ number: '7091234567', expected: 'AIRTEL', description: 'Airtel 709 format' },
	{ number: '7401234567', expected: 'AIRTEL', description: 'Airtel 740 format' },
	{ number: '7411234567', expected: 'AIRTEL', description: 'Airtel 741 format' },
	{ number: '7421234567', expected: 'AIRTEL', description: 'Airtel 742 format' },
	{ number: '7431234567', expected: 'AIRTEL', description: 'Airtel 743 format' },
	{ number: '7441234567', expected: 'AIRTEL', description: 'Airtel 744 format' },
	{ number: '7451234567', expected: 'AIRTEL', description: 'Airtel 745 format' },
	{ number: '7461234567', expected: 'AIRTEL', description: 'Airtel 746 format' },
	{ number: '7471234567', expected: 'AIRTEL', description: 'Airtel 747 format' },
	{ number: '7481234567', expected: 'AIRTEL', description: 'Airtel 748 format' },
	{ number: '7491234567', expected: 'AIRTEL', description: 'Airtel 749 format' },
	{ number: '7501234567', expected: 'AIRTEL', description: 'Airtel 750 format' },
	{ number: '7511234567', expected: 'AIRTEL', description: 'Airtel 751 format' },
	{ number: '7521234567', expected: 'AIRTEL', description: 'Airtel 752 format' },
	{ number: '7531234567', expected: 'AIRTEL', description: 'Airtel 753 format' },
	{ number: '7541234567', expected: 'AIRTEL', description: 'Airtel 754 format' },
	{ number: '7551234567', expected: 'AIRTEL', description: 'Airtel 755 format' },
	{ number: '7561234567', expected: 'AIRTEL', description: 'Airtel 756 format' },
	{ number: '7571234567', expected: 'AIRTEL', description: 'Airtel 757 format' },
	{ number: '7581234567', expected: 'AIRTEL', description: 'Airtel 758 format' },
	{ number: '7591234567', expected: 'AIRTEL', description: 'Airtel 759 format' },

	// International format tests
	{ number: '+2567601234567', expected: 'MTN', description: 'MTN international format' },
	{ number: '2567601234567', expected: 'MTN', description: 'MTN international format without +' },
	{ number: '+2567001234567', expected: 'AIRTEL', description: 'Airtel international format' },
	{
		number: '2567001234567',
		expected: 'AIRTEL',
		description: 'Airtel international format without +',
	},

	// Formatted numbers
	{ number: '+256 760 123 4567', expected: 'MTN', description: 'MTN formatted with spaces' },
	{ number: '+256-760-123-4567', expected: 'MTN', description: 'MTN formatted with dashes' },
	{ number: '(256) 760-123-4567', expected: 'MTN', description: 'MTN formatted with parentheses' },
];

// Invalid number test cases
const invalidTestCases = [
	{ number: '1234567890', description: 'Invalid prefix' },
	{
		number: '7101234567',
		description: 'Invalid prefix 710 (not 70X, 74X, 75X, 76X, 77X, 78X, 79X)',
	},
	{
		number: '7201234567',
		description: 'Invalid prefix 720 (not 70X, 74X, 75X, 76X, 77X, 78X, 79X)',
	},
	{
		number: '7301234567',
		description: 'Invalid prefix 730 (not 70X, 74X, 75X, 76X, 77X, 78X, 79X)',
	},
	{
		number: '8001234567',
		description: 'Invalid prefix 800 (not 70X, 74X, 75X, 76X, 77X, 78X, 79X)',
	},
	{
		number: '9001234567',
		description: 'Invalid prefix 900 (not 70X, 74X, 75X, 76X, 77X, 78X, 79X)',
	},
	{ number: '123456789', description: 'Too short' },
	{ number: '123456789012345', description: 'Too long' },
	{ number: '', description: 'Empty string' },
	{ number: 'abc123def', description: 'Contains letters' },
	{ number: '+1234567890', description: 'Non-Ugandan country code' },
];

/**
 * Run basic provider detection tests
 */
export function runBasicTests(): void {
	logger.info('🧪 Running Basic Provider Detection Tests...\n');

	let passed = 0;
	let failed = 0;

	for (const testCase of testCases) {
		try {
			const result = detectProvider(testCase.number);
			if (result === testCase.expected) {
				logger.info(`✅ ${testCase.description}: ${testCase.number} → ${result}`);
				passed++;
			} else {
				logger.info(
					`❌ ${testCase.description}: ${testCase.number} → ${result} (expected ${testCase.expected})`
				);
				failed++;
			}
		} catch (error) {
			logger.info(`❌ ${testCase.description}: ${testCase.number} → ERROR: ${error}`);
			failed++;
		}
	}

	logger.info(`\n📊 Basic Tests: ${passed} passed, ${failed} failed\n`);
}

/**
 * Run enhanced provider detection tests
 */
export function runEnhancedTests(): void {
	logger.info('🔍 Running Enhanced Provider Detection Tests...\n');

	for (const testCase of testCases.slice(0, 10)) {
		// Test first 10 cases
		try {
			const result = detectProviderEnhanced(testCase.number);
			logger.info(`📱 ${testCase.description}:`);
			logger.info(`   Number: ${result.originalNumber}`);
			logger.info(`   Provider: ${result.provider}`);
			logger.info(`   Confidence: ${result.confidence}`);
			logger.info(`   Formatted: ${result.formattedNumber}`);
			if (result.reason) logger.info(`   Reason: ${result.reason}`);
			logger.info('');
		} catch (error) {
			logger.info(`❌ ${testCase.description}: ERROR - ${error}\n`);
		}
	}
}

/**
 * Run phone formatting tests
 */
export function runFormattingTests(): void {
	logger.info('📞 Running Phone Formatting Tests...\n');

	const formatTestCases = [
		'7601234567',
		'+2567601234567',
		'2567601234567',
		'+256 760 123 4567',
		'(256) 760-123-4567',
	];

	for (const phone of formatTestCases) {
		const result = formatUgandanPhone(phone);
		logger.info(`📱 ${phone}:`);
		logger.info(`   Valid: ${result.isValid}`);
		logger.info(`   Formatted: ${result.formatted}`);
		if (result.error) logger.info(`   Error: ${result.error}`);
		logger.info('');
	}
}

/**
 * Run validation tests
 */
export function runValidationTests(): void {
	logger.info('✅ Running Validation Tests...\n');

	// Test valid numbers
	for (const testCase of testCases.slice(0, 5)) {
		const isValid = isUgandanMobileNumber(testCase.number);
		logger.info(`📱 ${testCase.number}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
	}

	logger.info('');

	// Test invalid numbers
	for (const testCase of invalidTestCases) {
		const isValid = isUgandanMobileNumber(testCase.number);
		logger.info(
			`📱 ${testCase.number || '(empty)'}: ${isValid ? '❌ Should be invalid' : '✅ Correctly invalid'}`
		);
	}

	logger.info('');
}

/**
 * Run provider prefix tests
 */
export function runPrefixTests(): void {
	logger.info('🏷️ Running Provider Prefix Tests...\n');

	const mtnPrefixes = getProviderPrefixes('MTN');
	const airtelPrefixes = getProviderPrefixes('AIRTEL');

	logger.info(`📱 MTN Prefixes (${mtnPrefixes.length}):`);
	logger.info(`   ${mtnPrefixes.slice(0, 10).join(', ')}${mtnPrefixes.length > 10 ? '...' : ''}`);

	logger.info(`\n📱 Airtel Prefixes (${airtelPrefixes.length}):`);
	logger.info(
		`   ${airtelPrefixes.slice(0, 10).join(', ')}${airtelPrefixes.length > 10 ? '...' : ''}`
	);

	logger.info('');
}

/**
 * Run all tests
 */
export function runAllTests(): void {
	logger.info('🚀 Starting Comprehensive Ugandan Provider Detection Tests\n');
	logger.info('='.repeat(60) + '\n');

	runBasicTests();
	runEnhancedTests();
	runFormattingTests();
	runValidationTests();
	runPrefixTests();

	logger.info('='.repeat(60));
	logger.info('🎉 All tests completed!\n');
}

// Export for use in other files
export { invalidTestCases, testCases };
