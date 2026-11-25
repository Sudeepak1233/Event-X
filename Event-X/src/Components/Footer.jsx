import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Mail, Phone, MapPin } from "lucide-react";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-about">
          <h2>
            <CalendarDays size={28} />
            Event-X
          </h2>

          <p>
            Discover, organize and experience amazing events. Event-X makes
            event planning and ticket booking simple, smart and memorable.
          </p>

          <div className="footer-social">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              f
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              ◎
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
            >
              𝕏
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/events">Explore Events</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        {/* Services */}
        <div className="footer-links">
          <h3>Our Services</h3>

          <Link to="/events">Event Booking</Link>
          <Link to="/organizer/dashboard">Event Management</Link>
          <Link to="/customer/tickets">Online Tickets</Link>
          <Link to="/organizer/create-event">Create Events</Link>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3>Contact Us</h3>

          <p>
            <Mail size={18} />
            support@eventx.com
          </p>

          <p>
            <Phone size={18} />
            +91 9876543210
          </p>

          <p>
            <MapPin size={18} />
            Vijayawada, India
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Event-X. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;