const DEFAULT_TIMEZONE = "Asia/Seoul";
const DEFAULT_BILLING_TIME = "09:00";

export function getClientTimezone(): string | null {
  if (typeof Intl === "undefined" || !Intl.DateTimeFormat) {
    return DEFAULT_TIMEZONE;
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function getDefaultBillingTime(): string {
  return DEFAULT_BILLING_TIME;
}
