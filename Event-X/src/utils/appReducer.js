import { isBookingCancelled } from "./bookings";

export function appReducer(state, action) {
  switch (action.type) {
    case "ADD_WISHLIST": {
      const email = String(action.item.userEmail || "").trim().toLowerCase();
      const alreadySaved = state.wishlist.some(
        (item) =>
          String(item.userEmail || "").trim().toLowerCase() === email &&
          String(item.eventId) === String(action.item.eventId)
      );
      return alreadySaved
        ? state
        : { ...state, wishlist: [...state.wishlist, action.item] };
    }
    case "REMOVE_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.filter(
          (item) =>
            !(
              String(item.userEmail || "").trim().toLowerCase() ===
                String(action.userEmail || "").trim().toLowerCase() &&
              String(item.eventId) === String(action.eventId)
            )
        )
      };
    case "ADD_REVIEW": {
      const email = String(action.review.userEmail || "").trim().toLowerCase();
      const duplicate = state.reviews.some(
        (review) =>
          String(review.userEmail || "").trim().toLowerCase() === email &&
          String(review.eventId) === String(action.review.eventId)
      );
      return duplicate
        ? state
        : { ...state, reviews: [...state.reviews, action.review] };
    }
    case "ADD_BOOKING":
      return state.bookings.some(
        (booking) => booking.bookingId === action.booking.bookingId
      )
        ? state
        : { ...state, bookings: [...state.bookings, action.booking] };
    case "CANCEL_BOOKING": {
      const email = String(action.userEmail || "").trim().toLowerCase();
      if (!email || action.bookingId == null) return state;

      const booking = state.bookings.find(
        (item) =>
          String(item.bookingId) === String(action.bookingId) &&
          String(item.email || "").trim().toLowerCase() === email
      );
      if (!booking || isBookingCancelled(booking)) return state;

      return {
        ...state,
        bookings: state.bookings.map((item) =>
          String(item.bookingId) === String(action.bookingId) &&
          String(item.email || "").trim().toLowerCase() === email
            ? {
                ...item,
                status: "Cancelled",
                cancelledAt: action.cancelledAt
              }
            : item
        )
      };
    }
    case "UPDATE_CUSTOMER_EMAIL": {
      const previousEmail = String(action.previousEmail || "").trim().toLowerCase();
      const updateEmail = (item) =>
        String(item.userEmail || "").trim().toLowerCase() === previousEmail
          ? { ...item, userEmail: action.email }
          : item;
      return {
        ...state,
        bookings: state.bookings.map((booking) =>
          String(booking.email || "").trim().toLowerCase() === previousEmail
            ? {
                ...booking,
                email: action.email,
                customerName: action.name
              }
            : booking
        ),
        wishlist: state.wishlist.map(updateEmail),
        reviews: state.reviews.map(updateEmail),
        notifications: state.notifications.map(updateEmail)
      };
    }
    case "REMOVE_CUSTOMER_BOOKINGS":
      return {
        ...state,
        bookings: state.bookings.filter(
          (booking) =>
            String(booking.email || "").trim().toLowerCase() !==
            String(action.userEmail || "").trim().toLowerCase()
        )
      };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications]
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.id &&
          String(notification.userEmail || "").trim().toLowerCase() ===
            String(action.userEmail || "").trim().toLowerCase()
            ? { ...notification, read: true }
            : notification
        )
      };
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) =>
            String(notification.userEmail || "").trim().toLowerCase() !==
            String(action.userEmail || "").trim().toLowerCase()
        )
      };
    default:
      return state;
  }
}
