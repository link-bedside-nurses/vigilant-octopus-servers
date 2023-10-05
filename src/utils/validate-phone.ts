export function validateUgandanPhoneNumber(phone: string): boolean {
    return /^256\d{9}$/.test(phone);
}