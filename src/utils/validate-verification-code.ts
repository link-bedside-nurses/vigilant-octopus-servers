export function validateVerificationCode(verificationCode: string): boolean {
    const numericRegex = /^\d+$/;
    return numericRegex.test(verificationCode) && verificationCode.length === 5;
}
