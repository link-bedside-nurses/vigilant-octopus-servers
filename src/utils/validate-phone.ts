export function validateUgandanPhoneNumber(phone: string): boolean {
    return /^256[2-7]\d{8}$/.test(phone);
}
