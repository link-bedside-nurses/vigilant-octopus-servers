export function verify(storedOTP: string | undefined, otp: string) {
  return storedOTP === otp;
}

export function checkIsOTPExpired(otpExpiresAt: string) {
  const expiresAt = new Date(otpExpiresAt as string | number | Date);

  if (expiresAt < new Date()) {
    return true;
  } else {
    return false;
  }
}
