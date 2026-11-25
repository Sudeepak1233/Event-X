
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublishedEvents } from "../utils/events";
import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import "./Payment.css";

const sampleEvents = [
  {
    id: 1,
    title: "Music Festival 2026",
    date: "20 December 2026",
    location: "Vijayawada",
    price: 499
  },
  {
    id: 2,
    title: "Technology Summit",
    date: "25 December 2026",
    location: "Hyderabad",
    price: 799
  },
  {
    id: 3,
    title: "Sports Championship",
    date: "28 December 2026",
    location: "Visakhapatnam",
    price: 299
  },
  {
    id: 4,
    title: "Education Expo",
    date: "30 December 2026",
    location: "Vijayawada",
    price: 199
  },
  {
    id: 5,
    title: "Business Conference",
    date: "5 January 2027",
    location: "Hyderabad",
    price: 999
  },
  {
    id: 6,
    title: "Cultural Night",
    date: "10 January 2027",
    location: "Guntur",
    price: 399
  }
];

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispatch } = useAppData();

  const events = usePublishedEvents(sampleEvents);
  const event = events.find((item) => String(item.id) === id);

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const name = user?.name || "";
  const email = user?.email || "";

  if (!event) {
    return <h2 className="payment-error">Event not found!</h2>;
  }

  const total = event.price * quantity;

  const handlePayment = (e) => {
    e.preventDefault();

    if (user?.role !== "customer" || !normalizeEmail(user.email)) {
      navigate("/login", {
        state: { from: `/ticket-booking/${event.id}` }
      });
      return;
    }

    const booking = {
      bookingId: "EVX" + Date.now(),
      eventId: event.id,
      eventName: event.title,
      eventDate: event.date,
      customerName: user.name || name,
      email: user.email,
      quantity,
      totalAmount: total,
      paymentMethod,
      bookingDate: new Date().toLocaleDateString(),
      status: "Demo confirmed"
    };

    dispatch({ type: "ADD_BOOKING", booking });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `${Date.now()}-booking`,
        userEmail: normalizeEmail(user.email),
        title: "Booking confirmed",
        message: `Your demo booking for ${event.title} is confirmed.`,
        createdAt: new Date().toISOString(),
        read: false,
        link: "/my-bookings"
      }
    });
    navigate("/my-bookings", { state: { bookingConfirmed: true } });
  };

  return (
    <div className="payment-page">

      <div className="payment-header">
        <h1>Event<span>-X</span></h1>
        <p>Secure Ticket Booking</p>
      </div>

      <div className="payment-container">

        <div className="payment-form">

          <h2>Complete Your Booking</h2>
          <p className="payment-subtitle">
            Enter your details and select a payment method.
          </p>

          <form onSubmit={handlePayment}>

            <h3>Customer Information</h3>

            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              readOnly
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              readOnly
              required
            />

            <h3>Select Tickets</h3>

            <label>Number of Tickets</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} Ticket{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <h3>Payment Method</h3>

            <div className="payment-methods">

              {["UPI", "Card", "Net Banking", "Cash on Arrival"].map(
                (method) => (
                  <label
                    className={`payment-option ${
                      paymentMethod === method ? "selected" : ""
                    }`}
                    key={method}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    {method}
                  </label>
                )
              )}

            </div>

            <button type="submit" className="pay-button">
              Confirm Booking – ₹{total}
            </button>

          </form>
        </div>

        <div className="order-summary">

          <h2>Order Summary</h2>

          <div className="summary-event">
            <h3>{event.title}</h3>
            <p>📅 {event.date}</p>
            <p>📍 {event.location}</p>
          </div>

          <div className="summary-row">
            <span>Ticket Price</span>
            <span>₹{event.price}</span>
          </div>

          <div className="summary-row">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>

          <div className="summary-total">
            <span>Total Amount</span>
            <strong>₹{total}</strong>
          </div>

          <p className="secure-text">
            🔒 Your booking information is stored securely in this demo.
          </p>

        </div>

      </div>
    </div>
  );
}

export default Payment;
