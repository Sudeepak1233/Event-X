
import React, { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  ArrowLeft,
  Star
} from "lucide-react";

import Layout from "../Components/Layout";
import { usePublishedEvents } from "../utils/events";
import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import "./EventDetails.css";

const sampleEvents = [
  {
    id: 1,
    title: "Music Festival 2026",
    category: "Music",
    description:
      "Enjoy an unforgettable night filled with live performances, amazing music, entertainment and exciting experiences. Join music lovers for a memorable celebration.",
    date: "20 Dec 2026",
    time: "6:00 PM",
    location: "Vijayawada",
    price: 499,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea"
  },
  {
    id: 2,
    title: "Technology Summit",
    category: "Technology",
    description:
      "Explore modern technologies, artificial intelligence, software innovations and future trends. Meet technology professionals and expand your knowledge.",
    date: "25 Dec 2026",
    time: "10:00 AM",
    location: "Hyderabad",
    price: 799,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
  },
  {
    id: 3,
    title: "Sports Championship",
    category: "Sports",
    description:
      "Experience thrilling sports competitions, exciting activities and unforgettable sporting moments.",
    date: "28 Dec 2026",
    time: "4:00 PM",
    location: "Visakhapatnam",
    price: 299,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"
  },
  {
    id: 4,
    title: "Education Expo",
    category: "Education",
    description:
      "Discover educational opportunities, colleges, courses and career guidance from experts.",
    date: "30 Dec 2026",
    time: "11:00 AM",
    location: "Vijayawada",
    price: 199,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94"
  },
  {
    id: 5,
    title: "Business Conference",
    category: "Business",
    description:
      "Connect with entrepreneurs, business professionals and industry leaders.",
    date: "05 Jan 2027",
    time: "9:30 AM",
    location: "Hyderabad",
    price: 999,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622"
  },
  {
    id: 6,
    title: "Cultural Night",
    category: "Cultural",
    description:
      "Celebrate culture, traditions, music and dance through a wonderful evening.",
    date: "10 Jan 2027",
    time: "5:00 PM",
    location: "Guntur",
    price: 399,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a"
  }
];

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { state, dispatch } = useAppData();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const events = usePublishedEvents(sampleEvents);

  const event = events.find((item) => String(item.id) === id);
  const eventReviews = state.reviews.filter(
    (review) => String(review.eventId) === String(id)
  );
  const userEmail = normalizeEmail(user?.email);
  const existingReview = eventReviews.find(
    (review) => normalizeEmail(review.userEmail) === userEmail
  );
  const averageRating = eventReviews.length
    ? eventReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      eventReviews.length
    : 0;

  const submitReview = (submitEvent) => {
    submitEvent.preventDefault();
    if (user?.role !== "customer") {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` }
      });
      return;
    }
    if (existingReview) {
      setReviewMessage("You have already reviewed this event.");
      return;
    }
    if (!rating || !reviewText.trim()) {
      setReviewMessage("Choose a star rating and write a review.");
      return;
    }

    dispatch({
      type: "ADD_REVIEW",
      review: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        eventId: event.id,
        userEmail,
        userName: user.name || "Customer",
        rating,
        text: reviewText.trim(),
        createdAt: new Date().toISOString()
      }
    });
    setReviewText("");
    setRating(0);
    setReviewMessage("Thanks for sharing your review!");
  };

  if (!event) {
    return (
      <Layout>
        <div className="event-not-found">
          <h2>Event Not Found</h2>
          <p>The event you are looking for does not exist.</p>
          <Link to="/events">Back to Events</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="event-details-page">

        <Link to="/events" className="event-back-link">
          <ArrowLeft size={18} /> Back to Events
        </Link>

        <div className="event-details-card">

          <div className="event-details-image">
            <img
              src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"}
              alt={event.title}
            />
            <span>{event.category}</span>
          </div>

          <div className="event-details-content">

            <h1>{event.title}</h1>

            <p className="event-details-description">
              {event.description}
            </p>

            <div className="event-info-list">
              <div>
                <CalendarDays size={21} />
                <span>
                  <strong>Date</strong>
                  {event.date}
                </span>
              </div>

              <div>
                <Clock size={21} />
                <span>
                  <strong>Time</strong>
                  {event.time}
                </span>
              </div>

              <div>
                <MapPin size={21} />
                <span>
                  <strong>Location</strong>
                  {event.location}
                </span>
              </div>

              <div>
                <Ticket size={21} />
                <span>
                  <strong>Ticket Price</strong>
                  ₹{event.price}
                </span>
              </div>
            </div>

            <section className="event-reviews" aria-labelledby="event-reviews-title">
              <div className="event-reviews-heading">
                <div>
                  <h2 id="event-reviews-title">Customer reviews</h2>
                  <p>
                    <Star size={17} fill={eventReviews.length ? "currentColor" : "none"} />
                    {eventReviews.length
                      ? `${averageRating.toFixed(1)} out of 5 · ${eventReviews.length} ${eventReviews.length === 1 ? "review" : "reviews"}`
                      : "No reviews yet"}
                  </p>
                </div>
              </div>

              {user?.role === "customer" ? (
                existingReview ? (
                  <p className="event-review-notice" role="status">
                    You have already submitted a review for this event.
                  </p>
                ) : (
                  <form className="event-review-form" onSubmit={submitReview}>
                    <label>Your rating</label>
                    <div className="event-review-stars" role="radiogroup" aria-label="Choose a rating from 1 to 5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={rating === value}
                          aria-label={`${value} star${value === 1 ? "" : "s"}`}
                          onClick={() => setRating(value)}
                        >
                          <Star size={23} fill={rating >= value ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <label htmlFor="event-review-text">Your review</label>
                    <textarea
                      id="event-review-text"
                      value={reviewText}
                      onChange={(inputEvent) => setReviewText(inputEvent.target.value)}
                      rows="3"
                      maxLength="1000"
                      placeholder="Share what you liked about this event..."
                      required
                    />
                    <button className="event-review-submit" type="submit">Submit review</button>
                  </form>
                )
              ) : (
                <p className="event-review-notice">
                  <Link to="/login" state={{ from: `${location.pathname}${location.search}` }}>
                    Log in as a customer
                  </Link>{" "}
                  to leave a review.
                </p>
              )}
              {reviewMessage && <p className="event-review-message" role="status">{reviewMessage}</p>}

              <div className="event-review-list">
                {eventReviews.length ? eventReviews.slice().reverse().map((review) => (
                  <article className="event-review-item" key={review.id}>
                    <div className="event-review-item-heading">
                      <strong>{review.userName || "Customer"}</strong>
                      <span>
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={14}
                            fill={index < Number(review.rating) ? "currentColor" : "none"}
                          />
                        ))}
                      </span>
                    </div>
                    <p>{review.text}</p>
                    <time dateTime={review.createdAt}>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : ""}
                    </time>
                  </article>
                )) : <p className="event-review-no-results">Be the first to share your experience.</p>}
              </div>
            </section>

            <div className="event-booking-section">
              <div>
                <p>Starting from</p>
                <h2>₹{event.price}</h2>
              </div>

              <Link
                to={`/ticket-booking/${event.id}`}
                className="event-book-button"
              >
                Book Now
              </Link>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EventDetails;
