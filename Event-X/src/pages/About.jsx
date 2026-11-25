
import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Ticket,
  Users,
  ShieldCheck,
  Target,
  Eye,
  Heart,
  ArrowRight
} from "lucide-react";

import Layout from "../Components/Layout";
import "./About.css";

function About() {
  return (
    <Layout>
      <div className="about-page">

        {/* Hero Section */}
        <section className="about-hero">
          <span>ABOUT EVENT-X</span>
          <h1>Making Every Event Memorable</h1>
          <p>
            Your all-in-one platform to discover events, book tickets,
            and manage unforgettable experiences.
          </p>
        </section>

        {/* Introduction */}
        <section className="about-intro">
          <div className="about-intro-image">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
              alt="People enjoying an event"
            />
          </div>

          <div className="about-intro-content">
            <span className="about-label">WHO WE ARE</span>
            <h2>Welcome to Event-X</h2>
            <p>
              Event-X is an event management platform designed to make
              event planning, organization, discovery, and ticket booking
              simple and convenient.
            </p>
            <p>
              Our platform connects customers and event organizers through
              a centralized system. Customers can explore events and book
              tickets, while organizers can create and manage their events.
            </p>
            <Link to="/events" className="about-button">
              Explore Events <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Mission and Vision */}
        <section className="about-mission">
          <div className="mission-card">
            <Target size={38} />
            <h2>Our Mission</h2>
            <p>
              To simplify event management by providing an accessible
              platform for event discovery, organization, and ticket booking.
            </p>
          </div>

          <div className="mission-card">
            <Eye size={38} />
            <h2>Our Vision</h2>
            <p>
              To create a connected event community where customers and
              organizers can enjoy smooth and efficient experiences.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="about-features">
          <h2>What We Offer</h2>
          <p className="about-section-subtitle">
            Useful tools for everyone involved in an event.
          </p>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <CalendarDays size={35} />
              <h3>Event Discovery</h3>
              <p>Explore different events based on interests and categories.</p>
            </div>

            <div className="about-feature-card">
              <Ticket size={35} />
              <h3>Ticket Booking</h3>
              <p>Choose events and manage ticket bookings conveniently.</p>
            </div>

            <div className="about-feature-card">
              <Users size={35} />
              <h3>Organizer Tools</h3>
              <p>Create events and manage registrations in one place.</p>
            </div>

            <div className="about-feature-card">
              <ShieldCheck size={35} />
              <h3>Platform Management</h3>
              <p>Support platform administration and event monitoring.</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about-values">
          <Heart size={38} />
          <h2>Our Commitment</h2>
          <p>
            We aim to make event experiences more organized, convenient,
            and enjoyable for customers and organizers.
          </p>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2>Be Part of Event-X</h2>
          <p>Discover exciting events or start organizing your own.</p>
          <Link to="/register" className="about-button">
            Join Us Today <ArrowRight size={18} />
          </Link>
        </section>

      </div>
    </Layout>
  );
}

export default About;
