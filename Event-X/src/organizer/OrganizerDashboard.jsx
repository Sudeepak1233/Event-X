
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  MapPin,
  Clock,
  Trash2
} from "lucide-react";

import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import { isBookingCancelled } from "../utils/bookings";
import NotificationCenter from "../Components/NotificationCenter";
import "./OrganizerDashboard.css";

function OrganizerDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { state, dispatch } = useAppData();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [eventFilter, setEventFilter] = useState("all");

  const [events, setEvents] = useState(() => {
    return JSON.parse(localStorage.getItem("organizerEvents") || "[]");
  });
  const [approved, setApproved] = useState(() =>
    JSON.parse(localStorage.getItem("approvedEvents") || "[]")
  );
  const [rejected, setRejected] = useState(() =>
    JSON.parse(localStorage.getItem("rejectedEvents") || "[]")
  );
  const [eventLoadError, setEventLoadError] = useState("");

  const organizerEmail = normalizeEmail(user.email);
  const organizerEvents = events.filter(
    (event) => normalizeEmail(event.organizerEmail) === organizerEmail
  );
  const organizerEventIds = new Set(
    organizerEvents.map((event) => String(event.id))
  );
  const eventBookings = state.bookings.filter((booking) =>
    organizerEventIds.has(String(booking.eventId))
  );
  const activeEventBookings = eventBookings.filter(
    (booking) => !isBookingCancelled(booking)
  );
  const totalRegistrations = activeEventBookings.reduce(
    (total, booking) => total + Math.max(0, Number(booking.quantity) || 0),
    0
  );
  const totalRevenue = activeEventBookings.reduce(
    (total, booking) => total + Math.max(0, Number(booking.totalAmount) || 0),
    0
  );

  useEffect(() => {
    let active = true;
    fetch(`/api/organizer/events?email=${encodeURIComponent(user.email || "")}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Organizer event request failed with status ${response.status}.`);
        }
        return response.json();
      })
      .then(({ events: storedEvents }) => {
        if (!active) return;
        const previousEvents = JSON.parse(
          localStorage.getItem("organizerEvents") || "[]"
        );
        storedEvents.forEach((event) => {
          const previousEvent = previousEvents.find(
            (item) => String(item.id) === String(event.id)
          );
          if (
            previousEvent &&
            previousEvent.status !== event.status &&
            ["approved", "rejected"].includes(event.status) &&
            normalizeEmail(event.organizerEmail) === normalizeEmail(user.email)
          ) {
            dispatch({
              type: "ADD_NOTIFICATION",
              notification: {
                id: `${Date.now()}-${event.id}-${event.status}`,
                userEmail: normalizeEmail(user.email),
                title: event.status === "approved" ? "Event approved" : "Event denied",
                message: event.status === "approved"
                  ? `${event.title} was approved by the platform owner.`
                  : `${event.title} was denied by the platform owner.`,
                createdAt: new Date().toISOString(),
                read: false,
                link: "/organizer/dashboard"
              }
            });
          }
        });
        const approvedIds = storedEvents
          .filter((event) => event.status === "approved")
          .map((event) => event.id);
        const rejectedIds = storedEvents
          .filter((event) => event.status === "rejected")
          .map((event) => event.id);
        setEvents(storedEvents);
        setApproved(approvedIds);
        setRejected(rejectedIds);
        localStorage.setItem("organizerEvents", JSON.stringify(storedEvents));
        localStorage.setItem("approvedEvents", JSON.stringify(approvedIds));
        localStorage.setItem("rejectedEvents", JSON.stringify(rejectedIds));
      })
      .catch((error) => {
        console.error("Could not load organizer events from the server.", error);
        if (active) setEventLoadError("Unable to load your server-saved events.");
      });

    return () => {
      active = false;
    };
  }, [user.email, dispatch]);

  const [formData, setFormData] = useState({
    title: "",
    category: "Music",
    date: "",
    time: "",
    location: "",
    price: "",
    description: "",
    image: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    const newEvent = {
      ...formData,
      price: Number(formData.price),
      organizerEmail: user.email
    };

    try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent)
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Event submission failed.");
    }

    const { event: savedEvent } = await response.json();
    const updatedEvents = [...events, savedEvent];
    setEvents(updatedEvents);
    localStorage.setItem("organizerEvents", JSON.stringify(updatedEvents));
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `${Date.now()}-${savedEvent.id}-submitted`,
        userEmail: normalizeEmail(user.email),
        title: "Event submitted",
        message: `${savedEvent.title} was submitted for platform review.`,
        createdAt: new Date().toISOString(),
        read: false,
        link: "/organizer/dashboard"
      }
    });

    setFormData({
      title: "",
      category: "Music",
      date: "",
      time: "",
      location: "",
      price: "",
      description: "",
      image: ""
    });

    alert("Event submitted for platform review.");
    setActiveTab("myEvents");
    } catch (error) {
    console.error("Event submission failed.", error);
    alert(error.message || "Could not submit the event.");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
    const response = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizerEmail: user.email })
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Event removal failed.");
    }

    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem("organizerEvents", JSON.stringify(updatedEvents));
    setApproved(approved.filter((eventId) => eventId !== id));
    setRejected(rejected.filter((eventId) => eventId !== id));
    } catch (error) {
    console.error("Event removal failed.", error);
    alert(error.message || "Could not remove the event.");
    }
  };

  const getEventStatus = (eventId) => {
    const event = events.find(
      (item) => String(item.id) === String(eventId)
    );
    const status = event?.status ||
      (approved.some((id) => String(id) === String(eventId))
        ? "approved"
        : rejected.some((id) => String(id) === String(eventId))
          ? "rejected"
          : "pending");

    if (status === "approved") {
      return { label: "Approved", className: "approved" };
    }

    if (status === "rejected") {
      return { label: "Denied", className: "rejected" };
    }

    return { label: "Pending review", className: "pending" };
  };

  const visibleEvents = organizerEvents.filter((event) => {
    if (eventFilter === "all") return true;
    return getEventStatus(event.id).className === eventFilter;
  });

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="organizer-dashboard">

      {/* Sidebar */}
      <aside className="organizer-sidebar">
        <h2 className="organizer-logo">EVENT<span>-X</span></h2>

        <nav>
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={19} /> Dashboard
          </button>

          <button
            className={activeTab === "create" ? "active" : ""}
            onClick={() => setActiveTab("create")}
          >
            <PlusCircle size={19} /> Create Event
          </button>

          <button
            className={activeTab === "myEvents" ? "active" : ""}
            onClick={() => setActiveTab("myEvents")}
          >
            <CalendarDays size={19} /> My Events
          </button>

          <button
            className={activeTab === "registrations" ? "active" : ""}
            onClick={() => setActiveTab("registrations")}
          >
            <Users size={19} /> Registrations
          </button>

          <button
            className={activeTab === "analytics" ? "active" : ""}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 size={19} /> Analytics
          </button>
        </nav>

        <button className="organizer-logout" onClick={handleLogout}>
          <LogOut size={19} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="organizer-main">
        {eventLoadError && <p role="alert">{eventLoadError}</p>}

        <header className="organizer-header">
          <div>
            <h1>
              {activeTab === "dashboard" && "Organizer Dashboard"}
              {activeTab === "create" && "Create New Event"}
              {activeTab === "myEvents" && "My Events"}
              {activeTab === "registrations" && "Registrations"}
              {activeTab === "analytics" && "Event Analytics"}
            </h1>
            <p>Welcome, {user.name || "Organizer"}!</p>
          </div>

          <div className="organizer-header-actions">
            <NotificationCenter />
            <div className="organizer-avatar">
              {(user.name || "O").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <>
            <section className="organizer-welcome">
              <h2>Manage Your Events</h2>
              <p>Create, organize, and track your events with Event-X.</p>

              <button onClick={() => setActiveTab("create")}>
                <PlusCircle size={18} /> Create New Event
              </button>
            </section>

            <section className="organizer-stats">
              <div className="organizer-stat-card">
                <CalendarDays size={25} />
                <h3>{organizerEvents.length}</h3>
                <p>Total Events</p>
              </div>

              <div className="organizer-stat-card">
                <Users size={25} />
                <h3>{totalRegistrations}</h3>
                <p>Total Registrations</p>
              </div>

              <div className="organizer-stat-card">
                <BarChart3 size={25} />
                <h3>₹{totalRevenue.toLocaleString("en-IN")}</h3>
                <p>Total Revenue</p>
              </div>
            </section>

            <section className="organizer-recent">
              <h2>Recently Created Events</h2>

              {organizerEvents.length === 0 ? (
                <p className="organizer-empty-text">
                  You haven't created any events yet.
                </p>
              ) : (
                organizerEvents.slice(-3).reverse().map((event) => (
                  <div className="organizer-recent-item" key={event.id}>
                    <div>
                      <div className="organizer-recent-title">
                        <h3>{event.title}</h3>
                        <span className={`organizer-status-badge status-${getEventStatus(event.id).className}`}>
                          {getEventStatus(event.id).label}
                        </span>
                      </div>
                      <p>{event.date} · {event.location}</p>
                    </div>
                    <strong>₹{event.price}</strong>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {/* Create Event */}
        {activeTab === "create" && (
          <section className="organizer-form-card">
            <h2>Event Information</h2>

            <form onSubmit={handleCreateEvent}>
              <div className="organizer-form-grid">

                <div className="organizer-form-group">
                  <label>Event Name</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="organizer-form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option>Music</option>
                    <option>Technology</option>
                    <option>Sports</option>
                    <option>Education</option>
                    <option>Business</option>
                    <option>Cultural</option>
                    <option>Entertainment</option>
                  </select>
                </div>

                <div className="organizer-form-group">
                  <label>Event Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="organizer-form-group">
                  <label>Event Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="organizer-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event location"
                    required
                  />
                </div>

                <div className="organizer-form-group">
                  <label>Ticket Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter ticket price"
                    required
                  />
                </div>

                <div className="organizer-form-group full-width">
                  <label>Event Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Paste an image URL"
                  />
                </div>

                <div className="organizer-form-group full-width">
                  <label>Event Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe your event..."
                    required
                  />
                </div>

              </div>

              <button type="submit" className="organizer-submit">
                Create Event
              </button>
            </form>
          </section>
        )}

        {/* My Events */}
        {activeTab === "myEvents" && (
          <section className="organizer-my-events">
            <div className="organizer-event-toolbar">
              <p>Track each event’s approval status.</p>
              <label>
                <span>Show</span>
                <select
                  value={eventFilter}
                  onChange={(changeEvent) => setEventFilter(changeEvent.target.value)}
                >
                  <option value="all">All events</option>
                  <option value="pending">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Denied</option>
                </select>
              </label>
            </div>
            {organizerEvents.length === 0 ? (
              <div className="organizer-empty">
                <CalendarDays size={40} />
                <h2>No Events Created</h2>
                <p>Start by creating your first event.</p>
                <button onClick={() => setActiveTab("create")}>
                  Create Event
                </button>
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="organizer-empty">
                <CalendarDays size={40} />
                <h2>No {eventFilter === "rejected" ? "Denied" : eventFilter} Events</h2>
                <p>No events currently have this status.</p>
                <button type="button" onClick={() => setEventFilter("all")}>
                  Show All Events
                </button>
              </div>
            ) : (
              <div className="organizer-event-grid">
                {visibleEvents.map((event) => (
                  <div className="organizer-event-card" key={event.id}>
                    {event.image && (
                      <img src={event.image} alt={event.title} />
                    )}

                    <div className="organizer-event-info">
                      <div className="organizer-event-labels">
                        <span className="organizer-event-category">{event.category}</span>
                        <span className={`organizer-status-badge status-${getEventStatus(event.id).className}`}>
                          {getEventStatus(event.id).label}
                        </span>
                      </div>
                      <h3>{event.title}</h3>
                      <p><CalendarDays size={15} /> {event.date}</p>
                      <p><Clock size={15} /> {event.time}</p>
                      <p><MapPin size={15} /> {event.location}</p>

                      <div className="organizer-event-bottom">
                        <strong>₹{event.price}</strong>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          aria-label={`Delete ${event.title}`}
                        >
                          <Trash2 size={17} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Registrations */}
        {activeTab === "registrations" && (
          <section className="organizer-registrations">
            {eventBookings.length === 0 ? (
              <div className="organizer-empty">
                <Users size={42} />
                <h2>No Registrations Yet</h2>
                <p>Customer bookings for your events will appear here.</p>
              </div>
            ) : (
              eventBookings.slice().reverse().map((booking) => (
                <article className="organizer-registration-card" key={booking.bookingId}>
                  <div className="organizer-registration-heading">
                    <div>
                      <h2>{booking.eventName || "Event"}</h2>
                      <p>Booking ID: {booking.bookingId || "Not available"}</p>
                    </div>
                    <span className={`organizer-registration-status ${isBookingCancelled(booking) ? "is-cancelled" : ""}`}>
                      {isBookingCancelled(booking) ? "Cancelled" : booking.status || "Demo confirmed"}
                    </span>
                  </div>
                  <div className="organizer-registration-details">
                    <span>
                      <strong>Customer</strong>
                      {booking.customerName || "Customer"}
                    </span>
                    <span>
                      <strong>Tickets</strong>
                      {Number(booking.quantity) || 0}
                    </span>
                    <span>
                      <strong>Total</strong>
                      ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                    <span>
                      <strong>Booked on</strong>
                      {booking.bookingDate || "Not available"}
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <section className="organizer-stats">
            <div className="organizer-stat-card">
              <CalendarDays size={25} />
              <h3>{organizerEvents.length}</h3>
              <p>Events Created</p>
            </div>

            <div className="organizer-stat-card">
              <Users size={25} />
              <h3>{totalRegistrations}</h3>
              <p>Registrations</p>
            </div>

            <div className="organizer-stat-card">
              <BarChart3 size={25} />
              <h3>₹{totalRevenue.toLocaleString("en-IN")}</h3>
              <p>Revenue</p>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default OrganizerDashboard;
