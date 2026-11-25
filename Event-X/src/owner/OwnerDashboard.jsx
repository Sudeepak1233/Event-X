
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { CalendarDays, Check, LogOut, X } from "lucide-react";

import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import { isBookingCancelled } from "../utils/bookings";
import "./OwnerDashboard.css";

const readStoredItems = (key) =>
  JSON.parse(localStorage.getItem(key) || "[]");

function OwnerAnalytics() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { state, dispatch } = useAppData();
  const [organizers] = useState(() => readStoredItems("eventXOrganizers"));
  const [events, setEvents] = useState([]);
  const [eventLoadError, setEventLoadError] = useState("");
  const [eventActionError, setEventActionError] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [busyEventId, setBusyEventId] = useState(null);
  const bookings = state.bookings;
  const activeBookings = bookings.filter((booking) => !isBookingCancelled(booking));

  const approved = events.filter((event) => event.status === "approved");
  const rejected = events.filter((event) => event.status === "rejected");
  const pendingEvents = events.filter((event) => event.status === "pending");

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const importResponse = await fetch("/api/owner/events/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            events: readStoredItems("organizerEvents"),
            approvedIds: readStoredItems("approvedEvents"),
            rejectedIds: readStoredItems("rejectedEvents")
          })
        });
        if (!importResponse.ok) {
          throw new Error(`Legacy event import failed with status ${importResponse.status}.`);
        }

        const response = await fetch("/api/owner/events", {
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(`Owner event request failed with status ${response.status}.`);
        }
        const { events: storedEvents } = await response.json();
        if (!active) return;

        setEvents(storedEvents);
        localStorage.setItem("organizerEvents", JSON.stringify(storedEvents));
        localStorage.setItem(
          "approvedEvents",
          JSON.stringify(storedEvents.filter((event) => event.status === "approved").map((event) => event.id))
        );
        localStorage.setItem(
          "rejectedEvents",
          JSON.stringify(storedEvents.filter((event) => event.status === "rejected").map((event) => event.id))
        );
      } catch (error) {
        console.error("Could not load events for owner review.", error);
        if (active) setEventLoadError("Unable to load events from the server.");
      } finally {
        if (active) setLoadingEvents(false);
      }
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  const totalTickets = activeBookings.reduce(
    (total, booking) =>
      total + Number(booking.quantity || 0),
    0
  );

  const totalRevenue = activeBookings.reduce(
    (total, booking) =>
      total + Number(booking.totalAmount || 0),
    0
  );

  const organizerRevenue = (() => {
    const organizerTotals = new Map();
    const eventOrganizers = new Map(
      events.map((event) => [String(event.id), event.organizerEmail])
    );

    organizers.forEach((organizer) => {
      const email = normalizeEmail(organizer.email);
      if (!email) return;
      organizerTotals.set(email, {
        email,
        name: organizer.name || "Unnamed organizer",
        eventCount: events.filter(
          (event) => normalizeEmail(event.organizerEmail) === email
        ).length,
        bookingCount: 0,
        tickets: 0,
        revenue: 0
      });
    });

    activeBookings.forEach((booking) => {
      const email = normalizeEmail(eventOrganizers.get(String(booking.eventId)));
      if (!email) return;

      const totals = organizerTotals.get(email) || {
        email,
        name: email,
        eventCount: events.filter(
          (event) => normalizeEmail(event.organizerEmail) === email
        ).length,
        bookingCount: 0,
        tickets: 0,
        revenue: 0
      };
      totals.bookingCount += 1;
      totals.tickets += Number(booking.quantity || 0);
      totals.revenue += Number(booking.totalAmount || 0);
      organizerTotals.set(email, totals);
    });

    return [...organizerTotals.values()].sort((first, second) =>
      second.revenue - first.revenue
    );
  })();

  // Event approval chart
  const approvalData = [
    { name: "Approved", value: approved.length },
    { name: "Pending", value: pendingEvents.length },
    { name: "Rejected", value: rejected.length }
  ];

  const COLORS = ["#16a34a", "#f59e0b", "#ef4444"];

  // Tickets booked for each event
  const eventData = Object.values(
    activeBookings.reduce((result, booking) => {
      const eventName = booking.eventName || "Unknown Event";

      if (!result[eventName]) {
        result[eventName] = {
          name: eventName,
          tickets: 0
        };
      }

      result[eventName].tickets += Number(booking.quantity || 0);

      return result;
    }, {})
  );

  // Convert booking dates into JavaScript dates
  const parseBookingDate = (value) => {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    const parts = value.split("/");

    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  // Monthly revenue chart
  const monthlyData = {};

  activeBookings.forEach(booking => {
    const date = parseBookingDate(booking.bookingDate);

    if (!date) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: date.toLocaleString("en-IN", {
          month: "short",
          year: "numeric"
        }),
        revenue: 0
      };
    }

    monthlyData[key].revenue += Number(
      booking.totalAmount || 0
    );
  });

  const monthlyChartData = Object.keys(monthlyData)
    .sort()
    .map(key => monthlyData[key]);

  const getEventStatus = (eventId) => {
    return events.find((event) => String(event.id) === String(eventId))?.status || "pending";
  };

  const handleModerateEvent = async (eventId, status) => {
    setEventActionError("");
    setBusyEventId(eventId);
    try {
      const response = await fetch(`/api/owner/events/${encodeURIComponent(eventId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Event status update failed.");
      }

      const updatedEvents = events.map((event) =>
        event.id === eventId ? result.event : event
      );
      if (result.event.organizerEmail) {
        dispatch({
          type: "ADD_NOTIFICATION",
          notification: {
            id: `${Date.now()}-${result.event.id}-${status}`,
            userEmail: normalizeEmail(result.event.organizerEmail),
            title: status === "approved" ? "Event approved" : "Event denied",
            message: status === "approved"
              ? `${result.event.title} was approved by the platform owner.`
              : `${result.event.title} was denied by the platform owner.`,
            createdAt: new Date().toISOString(),
            read: false,
            link: "/organizer/dashboard"
          }
        });
      }
      setEvents(updatedEvents);
      localStorage.setItem("organizerEvents", JSON.stringify(updatedEvents));
      localStorage.setItem(
        "approvedEvents",
        JSON.stringify(updatedEvents.filter((event) => event.status === "approved").map((event) => event.id))
      );
      localStorage.setItem(
        "rejectedEvents",
        JSON.stringify(updatedEvents.filter((event) => event.status === "rejected").map((event) => event.id))
      );
    } catch (error) {
      console.error("Event moderation failed.", error);
      setEventActionError(error.message || "Could not update event status.");
    } finally {
      setBusyEventId(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) throw new Error("Owner sign-out failed.");

      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Owner sign-out failed.", error);
      setEventActionError("Could not sign out. Please try again.");
    }
  };

  return (
    <div className="owner-analytics">

      <div className="analytics-heading">
        <button type="button" className="owner-logout" onClick={handleLogout}>
          <LogOut size={17} /> Sign out
        </button>
        <div className="analytics-brand">
          <span className="analytics-brand-icon">
            <CalendarDays size={23} aria-hidden="true" />
          </span>
          <span className="analytics-brand-name">Event-X</span>
          <span className="analytics-brand-divider" aria-hidden="true" />
          <span className="analytics-brand-label">Owner Platform</span>
        </div>
        <h2>Platform Analytics</h2>
        <p>Monitor your complete Event-X platform performance.</p>
        {eventLoadError && <p role="alert">{eventLoadError}</p>}
        {eventActionError && <p role="alert">{eventActionError}</p>}
      </div>

      {/* Statistics */}
      <div className="analytics-stats">

        <div className="analytics-card">
          <h3>Total Organizers</h3>
          <h2>{organizers.length}</h2>
        </div>

        <div className="analytics-card">
          <h3>Total Events</h3>
          <h2>{events.length}</h2>
        </div>

        <div className="analytics-card">
          <h3>Total Tickets Booked</h3>
          <h2>{totalTickets}</h2>
        </div>

        <div className="analytics-card">
          <h3>Total Revenue</h3>
          <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
        </div>

      </div>

      {/* Charts */}
      <div className="analytics-grid">

        {/* Approval Pie Chart */}
        <div className="analytics-chart">
          <h3>Event Approval Status</h3>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={approvalData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label
              >
                {approvalData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Bar Chart */}
        <div className="analytics-chart">
          <h3>Tickets Booked by Event</h3>

          {eventData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="tickets"
                  fill="#e88900"
                  name="Tickets"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="analytics-empty">
              No booking data available yet.
            </p>
          )}
        </div>

        {/* Revenue Line Chart */}
        <div className="analytics-chart analytics-full">
          <h3>Monthly Revenue Analysis</h3>

          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="analytics-empty">
              Complete a demo booking to display monthly revenue.
            </p>
          )}
        </div>

      </div>

      <section className="analytics-details" aria-label="Platform details">
        <div className="analytics-detail-card">
          <div className="analytics-detail-heading">
            <div>
              <h3>Event approval details</h3>
              <p>Review every organizer-submitted event and its current status.</p>
            </div>
            <span className="analytics-count">{events.length} events</span>
          </div>

          <div className="analytics-table-wrap">
            <table className="analytics-table analytics-events-table">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Organizer</th>
                  <th scope="col">Date and location</th>
                  <th scope="col">Ticket price</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.length > 0 ? events.map((event) => {
                  const status = getEventStatus(event.id);
                  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

                  return (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.title || "Untitled event"}</strong>
                        <span>{event.category || "Uncategorized"}</span>
                      </td>
                      <td>{event.organizerEmail || "Not provided"}</td>
                      <td>
                        <strong>{event.date || "Date not set"}</strong>
                        <span>{event.location || "Location not set"}</span>
                      </td>
                      <td>₹{Number(event.price || 0).toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`status-badge status-${status}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        {status === "pending" ? (
                          <div className="event-review-actions">
                            <button
                              type="button"
                              className="event-approve-button"
                              onClick={() => handleModerateEvent(event.id, "approved")}
                              disabled={busyEventId === event.id}
                              aria-label={`Approve ${event.title || "event"}`}
                            >
                              <Check size={15} /> Approve
                            </button>
                            <button
                              type="button"
                              className="event-reject-button"
                              onClick={() => handleModerateEvent(event.id, "rejected")}
                              disabled={busyEventId === event.id}
                              aria-label={`Deny ${event.title || "event"}`}
                            >
                              <X size={15} /> Deny
                            </button>
                          </div>
                        ) : (
                          <span className="event-approval-complete">—</span>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td className="analytics-table-empty" colSpan="6">
                      {loadingEvents ? "Loading events..." : "No organizer events have been submitted yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-detail-card">
          <div className="analytics-detail-heading">
            <div>
              <h3>Organizer directory</h3>
              <p>Registered organizer accounts on the platform.</p>
            </div>
            <span className="analytics-count">{organizers.length} organizers</span>
          </div>

          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th scope="col">Organizer</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Account status</th>
                </tr>
              </thead>
              <tbody>
                {organizers.length > 0 ? organizers.map((organizer) => (
                  <tr key={organizer.email}>
                    <td><strong>{organizer.name || "Unnamed organizer"}</strong></td>
                    <td>{organizer.email || "Not provided"}</td>
                    <td>{organizer.phone || "Not provided"}</td>
                    <td>
                      <span className="status-badge status-registered">
                        Registered
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="analytics-table-empty" colSpan="4">
                      No organizer accounts have been registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-detail-card">
          <div className="analytics-detail-heading">
            <div>
              <h3>Revenue by organizer</h3>
              <p>Active booking revenue is attributed to the organizer who owns each event.</p>
            </div>
            <span className="analytics-count">
              ₹{organizerRevenue.reduce((total, organizer) => total + organizer.revenue, 0).toLocaleString("en-IN")} total
            </span>
          </div>

          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th scope="col">Organizer</th>
                  <th scope="col">Events</th>
                  <th scope="col">Bookings</th>
                  <th scope="col">Tickets</th>
                  <th scope="col">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {organizerRevenue.length > 0 ? organizerRevenue.map((organizer) => (
                  <tr key={organizer.email}>
                    <td>
                      <strong>{organizer.name}</strong>
                      <span>{organizer.email}</span>
                    </td>
                    <td>{organizer.eventCount}</td>
                    <td>{organizer.bookingCount}</td>
                    <td>{organizer.tickets}</td>
                    <td><strong>₹{organizer.revenue.toLocaleString("en-IN")}</strong></td>
                  </tr>
                )) : (
                  <tr>
                    <td className="analytics-table-empty" colSpan="5">
                      No organizer booking revenue is available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-detail-card">
          <div className="analytics-detail-heading">
            <div>
              <h3>Recent bookings</h3>
              <p>Demo bookings are recorded after a customer confirms checkout.</p>
            </div>
            <span className="analytics-count">{bookings.length} bookings</span>
          </div>

          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th scope="col">Booking</th>
                  <th scope="col">Customer and event</th>
                  <th scope="col">Booked on</th>
                  <th scope="col">Tickets</th>
                  <th scope="col">Total</th>
                  <th scope="col">Payment method</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? [...bookings].reverse().map((booking, index) => (
                  <tr key={booking.bookingId || `${booking.email}-${index}`}>
                    <td><strong>{booking.bookingId || "Booking"}</strong></td>
                    <td>
                      <strong>{booking.customerName || "Customer"}</strong>
                      <span>{booking.eventName || "Event not found"}</span>
                    </td>
                    <td>{booking.bookingDate || "Date not provided"}</td>
                    <td>{Number(booking.quantity || 0)}</td>
                    <td>₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}</td>
                    <td>{booking.paymentMethod || "Not provided"}</td>
                    <td>
                      <span className={`status-badge ${isBookingCancelled(booking) ? "status-cancelled" : "status-confirmed"}`}>
                        {isBookingCancelled(booking) ? "Cancelled" : booking.status || "Demo confirmed"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="analytics-table-empty" colSpan="7">
                      No bookings have been recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="analytics-note">
            Booking status reflects this demo app’s checkout record; no real payment is processed.
          </p>
        </div>
      </section>
    </div>
  );
}

export default OwnerAnalytics;
