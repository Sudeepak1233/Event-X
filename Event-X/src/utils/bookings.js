export function isBookingCancelled(booking) {
  return Boolean(booking?.cancelledAt) ||
    String(booking?.status || "").trim().toLowerCase() === "cancelled";
}
