// Normalize Israeli numbers to +972 and validate them client-side to mirror backend logic.
export function normalizeIsraeliPhone(input) {
  if (!input) return "";

  let digits = String(input).replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2); // drop international prefix
  if (digits.startsWith("972")) digits = digits.slice(3); // drop country code
  while (digits.startsWith("0")) digits = digits.slice(1); // drop all leading zeros

  // Israeli mobile only: 5XXXXXXXX (9 digits after removing leading 0)
  if (/^5\d{8}$/.test(digits)) return "+972" + digits;

  return "";
}

export function isValidIsraeliPhone(input) {
  return Boolean(normalizeIsraeliPhone(input));
}

export function formatPhoneForDisplay(input) {
  const normalized = normalizeIsraeliPhone(input);
  return normalized || input || "";
}
