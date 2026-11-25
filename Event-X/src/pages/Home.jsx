
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Ticket,
  Users,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

import Layout from "../Components/Layout";
import EventCard from "../Components/EventCard";
import SearchBar from "../Components/SearchBar";
import { usePublishedEvents } from "../utils/events";
import "./Home.css";

const sampleEvents = [
  {
    id: 1,
    title: "Music Festival 2026",
    category: "Music",
    description: "Enjoy an unforgettable night of live music and entertainment.",
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
    description: "Explore the latest innovations and meet technology experts.",
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
    description: "Experience exciting sports competitions and activities.",
    date: "28 Dec 2026",
    time: "4:00 PM",
    location: "Visakhapatnam",
    price: 299,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"
  }
];

function Home() {
  const availableEvents = usePublishedEvents(sampleEvents);
  const [filters, setFilters] = useState({ search: "", category: "All" });

  const filteredEvents = availableEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.location.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory =
      filters.category === "All" || event.category === filters.category;

    return matchesSearch && matchesCategory;
  });

  const handleSearch = (nextFilters) => {
    setFilters(nextFilters);
  };

  return (
    <Layout>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">WELCOME TO EVENT-X</span>

          <h1>
            Make Every Event
            <span> Unforgettable</span>
          </h1>

          <p>
            Discover exciting events, book your tickets, and create
            unforgettable memories with Event-X.
          </p>

          <div className="hero-buttons">
            <Link to="/events" className="primary-btn">
              Explore Events <ArrowRight size={18} />
            </Link>

            <Link to="/register" className="secondary-btn">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="search-section">
        <h2>Find Your Next Event</h2>
        <p>Search and discover events happening around you.</p>
        <SearchBar onSearch={handleSearch} />
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div>
            <h2>Featured Events</h2>
            <p>Discover events you don't want to miss.</p>
          </div>

          <Link to="/events" className="view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="no-events">No events found. Try another search.</p>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Event-X?</h2>
        <p className="features-subtitle">
          Everything you need to manage and enjoy events in one place.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <CalendarDays size={35} />
            <h3>Easy Event Discovery</h3>
            <p>Find events based on your interests and preferences.</p>
          </div>

          <div className="feature-card">
            <Ticket size={35} />
            <h3>Simple Ticket Booking</h3>
            <p>Book tickets quickly and manage your bookings easily.</p>
          </div>

          <div className="feature-card">
            <Users size={35} />
            <h3>Organizer Management</h3>
            <p>Organizers can create and manage their events.</p>
          </div>

          <div className="feature-card">
            <ShieldCheck size={35} />
            <h3>Secure Platform</h3>
            <p>A centralized platform for managing event activities.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Create Your Event?</h2>
        <p>Join Event-X and start managing amazing events today.</p>
        <Link to="/register" className="primary-btn">
          Join Event-X <ArrowRight size={18} />
        </Link>
      </section>
    </Layout>
  );
}

export default Home;
