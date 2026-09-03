// Phase 0 seat fee. A small charge is a quality filter and a no-show
// deterrent (SPEC.md section 9). Minted 2026-09-03 via /mint, live account.
export const SEAT_PRICE_LABEL = "$5";
export const PAYMENT_LINK = "https://buy.stripe.com/6oU14n5QS8gJ13W5GpaMU1N";

export function seatCheckoutUrl(email: string) {
  return `${PAYMENT_LINK}?prefilled_email=${encodeURIComponent(email)}`;
}
