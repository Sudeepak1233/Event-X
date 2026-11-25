import { useState } from "react";
import { CalendarDays, Ticket, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../Components/Layout";
import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import { usePublishedEvents } from "../utils/events";
import { isBookingCancelled } from "../utils/bookings";
import "./CustomerFeatures.css";

const sampleEvents = [
  { id: 1, title: "Music Festival 2026", date: "20 Dec 2026" },
  { id: 2, title: "Technology Summit", date: "25 Dec 2026" },
  { id: 3, title: "Sports Championship", date: "28 Dec 2026" },
  { id: 4, title: "Education Expo", date: "30 Dec 2026" },
  { id: 5, title: "Business Conference", date: "05 Jan 2027" },
  { id: 6, title: "Cultural Night", date: "10 Jan 2027" }
];

function MyBookings() {
  const { user } = useAuth();
  const { state, dispatch } = useAppData();
  const location = useLocation();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const events = usePublishedEvents(sampleEvents);
  const email = normalizeEmail(user?.email);
  const bookings = state.bookings.filter(
    (booking) => normalizeEmail(booking.email) === email
  );

  const handleCancelBooking = (booking) => {
    const shouldCancel = window.confirm(
      "Cancel this booking? It will remain in your booking history with a Cancelled status."
    );
    if (!shouldCancel) return;

    dispatch({
      type: "CANCEL_BOOKING",
      bookingId: booking.bookingId,
      userEmail: email,
      cancelledAt: new Date().toISOString()
    });
  };

  return (
    <Layout>
      <main className="customer-feature-page">
        <div className="customer-feature-heading">
          <span className="customer-feature-icon"><Ticket size={23} /></span>
          <div>
            <h1>My Bookings</h1>
            <p>View your confirmed event bookings and tickets.</p>
          </div>
        </div>

        {location.state?.bookingConfirmed && (
          <p className="booking-confirmation" role="status">
            Your demo booking is confirmed. Your ticket is ready below.
          </p>
        )}

        {bookings.length ? (
          <div className="booking-list">
            {bookings.slice().reverse().map((booking) => {
              const event = events.find(
                (item) => String(item.id) === String(booking.eventId)
              );
              const isExpanded = expandedBooking === booking.bookingId;
              return (
                <article className="booking-card" key={booking.bookingId}>
                  <div className="booking-card-main">
                    <div className="booking-event-icon"><CalendarDays size={21} /></div>
                    <div className="booking-event-copy">
                      <span className={`booking-status ${isBookingCancelled(booking) ? "is-cancelled" : ""}`}>
                        {isBookingCancelled(booking) ? "Cancelled" : booking.status || "Demo confirmed"}
                      </span>
                      <h2>{booking.eventName}</h2>
                      <p>{booking.eventDate || event?.date || "Event date not available"}</p>
                    </div>
                    <div className="booking-card-actions">
                      <button
                        type="button"
                        className="booking-secondary-button"
                        onClick={() => setExpandedBooking(isExpanded ? null : booking.bookingId)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Hide details" : "Booking details"}
                      </button>
                      <button
                        type="button"
                        className="customer-feature-button"
                        onClick={() => setSelectedTicket(booking)}
                        disabled={isBookingCancelled(booking)}
                      >
                        <Ticket size={16} /> View Ticket
                      </button>
                      {!isBookingCancelled(booking) && (
                        <button
                          type="button"
                          className="booking-cancel-button"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="booking-summary">
                    <span><small>Booking ID</small>{booking.bookingId}</span>
                    <span><small>Tickets</small>{booking.quantity}</span>
                    <span><small>Total paid</small>₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>

                  {isExpanded && (
                    <div className="booking-details">
                      <p><strong>Customer</strong>{booking.customerName || user.name}</p>
                      <p><strong>Email</strong>{booking.email}</p>
                      <p><strong>Booked on</strong>{booking.bookingDate || "Not available"}</p>
                      <p><strong>Payment method</strong>{booking.paymentMethod || "Not available"}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <section className="customer-feature-empty">
            <Ticket size={38} />
            <h2>No bookings yet</h2>
            <p>When you book an event, your tickets will appear here.</p>
            <Link to="/events" className="customer-feature-button">Explore Events</Link>
          </section>
        )}
      </main>

      {selectedTicket && (
        <div className="ticket-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedTicket(null);
        }}>
          <section className="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
            <button
              type="button"
              className="ticket-close"
              onClick={() => setSelectedTicket(null)}
              aria-label="Close ticket"
            >
              <X size={20} />
            </button>
            <span className="ticket-modal-label">EVENT-X · DEMO TICKET</span>
            <h2 id="ticket-title">{selectedTicket.eventName}</h2>
            <p>{selectedTicket.eventDate || events.find((item) => String(item.id) === String(selectedTicket.eventId))?.date || "Date not available"}</p>
            <div className="ticket-number">{selectedTicket.bookingId}</div>
            <div className="ticket-modal-summary">
              <span>{selectedTicket.quantity} ticket(s)</span>
              <strong>₹{Number(selectedTicket.totalAmount || 0).toLocaleString("en-IN")}</strong>
            </div>
            <small>This is a demo booking ticket. No real payment was processed.</small>
          </section>
        </div>
      )}
    </Layout>
  );
}

export default MyBookings;
