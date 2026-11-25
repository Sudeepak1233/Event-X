
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Star
} from "lucide-react";

import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import "./EventCard.css";

function EventCard({ event }) {
  const { user } = useAuth();
  const { state, dispatch } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const email = normalizeEmail(user?.email);
  const isWishlisted = state.wishlist.some(
    (item) =>
      item.userEmail === email && String(item.eventId) === String(event.id)
  );
  const reviews = state.reviews.filter(
    (review) => String(review.eventId) === String(event.id)
  );
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : 0;

  const handleWishlist = () => {
    if (user?.role !== "customer") {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` }
      });
      return;
    }

    dispatch(
      isWishlisted
        ? { type: "REMOVE_WISHLIST", userEmail: email, eventId: event.id }
        : {
            type: "ADD_WISHLIST",
            item: { userEmail: email, eventId: event.id, event }
          }
    );
  };

  return (
    <div className="event-card">

      <div className="event-card-image">
        <img
          src={event.image}
          alt={event.title}
        />

        <span className="event-card-category">
          {event.category}
        </span>
        <button
          type="button"
          className={`event-card-wishlist ${isWishlisted ? "is-saved" : ""}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? `Remove ${event.title} from wishlist` : `Add ${event.title} to wishlist`}
          aria-pressed={isWishlisted}
        >
          <Heart size={19} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="event-card-content">

        <h3>{event.title}</h3>

        <p className="event-card-description">
          {event.description}
        </p>

        <p className="event-card-rating" aria-label={`${averageRating.toFixed(1)} out of 5 stars from ${reviews.length} reviews`}>
          <Star size={15} fill={reviews.length ? "currentColor" : "none"} />
          {reviews.length ? `${averageRating.toFixed(1)} (${reviews.length})` : "No reviews yet"}
        </p>

        <div className="event-card-info">

          <p>
            <CalendarDays size={17} />
            {event.date}
          </p>

          <p>
            <Clock size={17} />
            {event.time}
          </p>

          <p>
            <MapPin size={17} />
            {event.location}
          </p>

        </div>

        <div className="event-card-bottom">

          <div className="event-price">
            <small>Starting from</small>
            <h4>₹{event.price}</h4>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="event-card-button"
          >
            View Details
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>

    </div>
  );
}

export default EventCard;
