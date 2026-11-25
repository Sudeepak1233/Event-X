
import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageCircle
} from "lucide-react";

import Layout from "../Components/Layout";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo only: connect this form to a backend or email service later.
    console.log("Contact Form:", formData);

    alert("Thank you! Your message has been submitted.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <Layout>
      <div className="contact-page">

        <section className="contact-hero">
          <span>GET IN TOUCH</span>
          <h1>Contact Event-X</h1>
          <p>
            Have questions or suggestions? We would love to hear from you.
          </p>
        </section>

        <section className="contact-container">

          <div className="contact-info">
            <h2>Let's Talk</h2>
            <p className="contact-info-description">
              Contact our team for assistance, information, or feedback
              about the Event-X platform.
            </p>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Mail size={22} />
              </div>
              <div>
                <h3>Email</h3>
                <p>support@eventx.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Phone size={22} />
              </div>
              <div>
                <h3>Phone</h3>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <MapPin size={22} />
              </div>
              <div>
                <h3>Location</h3>
                <p>Vijayawada, Andhra Pradesh, India</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Clock size={22} />
              </div>
              <div>
                <h3>Working Hours</h3>
                <p>Monday - Saturday, 9 AM - 6 PM</p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <div className="contact-form-heading">
              <MessageCircle size={25} />
              <h2>Send Us a Message</h2>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="contact-form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter message subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
                <label>Your Message</label>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="contact-submit">
                Send Message <Send size={18} />
              </button>

            </form>
          </div>

        </section>
      </div>
    </Layout>
  );
}

export default Contact;
