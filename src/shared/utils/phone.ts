const internationalPhonePattern = /^\+\d{8,15}$/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidNationalPhone(countryCode: string, phone: string): boolean {
  const countryDigits = digitsOnly(countryCode);
  const phoneDigits = digitsOnly(phone);
  return (
    countryDigits.length >= 1 &&
    countryDigits.length <= 4 &&
    phoneDigits.length >= 7 &&
    countryDigits.length + phoneDigits.length <= 15
  );
}

export function isValidInternationalPhone(phone: string): boolean {
  return internationalPhonePattern.test(phone.replace(/[\s()-]/g, ""));
}
