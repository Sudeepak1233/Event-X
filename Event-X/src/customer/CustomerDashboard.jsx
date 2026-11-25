
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  User,
  LogOut,
  Search,
  ArrowRight,
  UserPlus,
  Pencil,
  Trash2,
  Save,
  X,
  ArrowLeftRight,
  Heart
} from "lucide-react";

import { usePublishedEvents } from "../utils/events";
import { toPublicUser } from "../utils/auth";
import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import { isBookingCancelled } from "../utils/bookings";
import NotificationCenter from "../Components/NotificationCenter";
import EventCard from "../Components/EventCard";
import "./CustomerDashboard.css";

const sampleEvents = [
  {
    id: 1,
    title: "Music Festival 2026",
    category: "Music",
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
    date: "28 Dec 2026",
    time: "4:00 PM",
    location: "Visakhapatnam",
    price: 299,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"
  }
];

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { state, dispatch } = useAppData();
  const events = usePublishedEvents(sampleEvents);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [customerAccounts, setCustomerAccounts] = useState(() =>
    JSON.parse(localStorage.getItem("eventXCustomers") || "[]")
  );
  const [profileForm, setProfileForm] = useState(() => ({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || ""
  }));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );
  const userBookings = state.bookings.filter(
    (booking) =>
      normalizeEmail(booking.email) === normalizeEmail(user?.email) &&
      !isBookingCancelled(booking)
  );

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const handleProfileChange = (event) => {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value
    });
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    const updatedUser = {
      ...user,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim()
    };
    const previousEmail = String(user.email || "").trim().toLowerCase();
    const updatedEmail = updatedUser.email.toLowerCase();
    const customers = JSON.parse(
      localStorage.getItem("eventXCustomers") || "[]"
    );
    const emailInUse = customers.some((customer) => {
      const customerEmail = String(customer.email || "").trim().toLowerCase();
      return customerEmail === updatedEmail && customerEmail !== previousEmail;
    });

    if (emailInUse) {
      setProfileMessage("Another customer account already uses this email.");
      return;
    }

    const existingAccount = customers.find(
      (customer) =>
        String(customer.email || "").trim().toLowerCase() === previousEmail
    );
    const updatedCustomers = customers.filter(
      (customer) =>
        String(customer.email || "").trim().toLowerCase() !== previousEmail
    );
    updatedCustomers.push({ ...existingAccount, ...updatedUser });
    localStorage.setItem("eventXCustomers", JSON.stringify(updatedCustomers));
    setCustomerAccounts(updatedCustomers);

    dispatch({
      type: "UPDATE_CUSTOMER_EMAIL",
      previousEmail,
      email: updatedUser.email,
      name: updatedUser.name
    });

    setUser(updatedUser);
    setProfileForm({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone
    });
    setIsEditingProfile(false);
    setProfileMessage("Your account details have been updated.");
  };

  const handleDeleteAccount = () => {
    const shouldDelete = window.confirm(
      "Delete your customer account and its booking records? This cannot be undone."
    );

    if (!shouldDelete) return;

    const email = String(user.email || "").trim().toLowerCase();
    const customers = JSON.parse(
      localStorage.getItem("eventXCustomers") || "[]"
    );
    const remainingCustomers = customers.filter(
      (customer) =>
        String(customer.email || "").trim().toLowerCase() !== email
    );
    localStorage.setItem("eventXCustomers", JSON.stringify(remainingCustomers));
    dispatch({ type: "REMOVE_CUSTOMER_BOOKINGS", userEmail: email });
    setUser(null);
    navigate("/login");
  };

  const handleAddCustomerAccount = () => {
    navigate("/register");
  };

  const currentEmail = String(user.email || "").trim().toLowerCase();
  const hasCurrentAccount = customerAccounts.some(
    (account) =>
      String(account.email || "").trim().toLowerCase() === currentEmail
  );
  const switchableAccounts = hasCurrentAccount || !user.email
    ? customerAccounts
    : [...customerAccounts, user];

  const handleSwitchAccount = (event) => {
    const selectedEmail = event.target.value.trim().toLowerCase();
    const selectedAccount = switchableAccounts.find(
      (account) =>
        String(account.email || "").trim().toLowerCase() === selectedEmail
    );

    if (!selectedAccount) {
      setProfileMessage("That customer account could not be found.");
      return;
    }

    const publicUser = toPublicUser(selectedAccount);
    setUser(publicUser);
    setProfileForm({
      name: publicUser.name || "",
      email: publicUser.email || "",
      phone: publicUser.phone || ""
    });
    setIsEditingProfile(false);
    setProfileMessage(`Switched to ${publicUser.name || publicUser.email}.`);
  };

  return (
    <div className="customer-dashboard">

      {/* Sidebar */}
      <aside className="customer-sidebar">
        <h2 className="customer-logo">EVENT<span>-X</span></h2>

        <nav>
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={19} /> Dashboard
          </button>

          <button
            className={activeTab === "events" ? "active" : ""}
            onClick={() => setActiveTab("events")}
          >
            <CalendarDays size={19} /> Explore Events
          </button>

          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => navigate("/my-bookings")}
          >
            <Ticket size={19} /> My Bookings
          </button>

          <button onClick={() => navigate("/wishlist")}>
            <Heart size={19} /> Wishlist
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <User size={19} /> My Profile
          </button>
        </nav>

        <button className="customer-logout" onClick={handleLogout}>
          <LogOut size={19} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="customer-main">

        <header className="customer-header">
          <div>
            <h1>
              {activeTab === "dashboard" && "Customer Dashboard"}
              {activeTab === "events" && "Explore Events"}
              {activeTab === "bookings" && "My Bookings"}
              {activeTab === "profile" && "My Profile"}
            </h1>
            <p>Welcome back, {user?.name || "Customer"}!</p>
          </div>

          <div className="customer-header-actions">
            <NotificationCenter />
            <div className="customer-avatar">
              {(user?.name || "C").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <>
            <section className="customer-welcome">
              <div>
                <h2>Discover Amazing Events!</h2>
                <p>Find your next experience with Event-X.</p>
                <button onClick={() => setActiveTab("events")}>
                  Explore Events <ArrowRight size={17} />
                </button>
              </div>
            </section>

            <section className="customer-stats">
              <div className="customer-stat-card">
                <Ticket size={25} />
                <h3>{userBookings.length}</h3>
                <p>Total Bookings</p>
              </div>

              <div className="customer-stat-card">
                <CalendarDays size={25} />
                <h3>{events.length}</h3>
                <p>Available Events</p>
              </div>

              <div className="customer-stat-card">
                <User size={25} />
                <h3>Active</h3>
                <p>Account Status</p>
              </div>
            </section>

            <section className="customer-events-section">
              <div className="customer-section-heading">
                <h2>Recommended Events</h2>
                <button onClick={() => setActiveTab("events")}>
                  View All
                </button>
              </div>

              <div className="customer-event-grid">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Explore Events */}
        {activeTab === "events" && (
          <section className="customer-events-section">
            <div className="customer-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="customer-event-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}

              {filteredEvents.length === 0 && (
                <p>No events found.</p>
              )}
            </div>
          </section>
        )}

        {/* My Bookings */}
        {activeTab === "bookings" && (
          <section className="customer-empty">
            <Ticket size={45} />
            <h2>No Bookings Yet</h2>
            <p>Your booked events will appear here.</p>
            <button onClick={() => setActiveTab("events")}>
              Explore Events
            </button>
          </section>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <section className="customer-profile customer-profile-manage">
            <div className="profile-avatar">
              {(user.name || "C").charAt(0).toUpperCase()}
            </div>

            <h2>{user.name || "Customer"}</h2>
            <p className="profile-description">
              Manage your account details and customer accounts.
            </p>

            <div className="profile-switch">
              <label htmlFor="customer-account-switch">Switch customer account</label>
              <div className="profile-switch-control">
                <ArrowLeftRight size={17} aria-hidden="true" />
                <select
                  id="customer-account-switch"
                  value={currentEmail}
                  onChange={handleSwitchAccount}
                  disabled={switchableAccounts.length < 2}
                >
                  {switchableAccounts.map((account) => (
                    <option
                      key={account.email}
                      value={String(account.email || "").trim().toLowerCase()}
                    >
                      {account.name || account.email}
                      {String(account.email || "").trim().toLowerCase() === currentEmail
                        ? " (Current)"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              {switchableAccounts.length < 2 && (
                <small>Register another customer account to switch between accounts.</small>
              )}
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-action-button"
                onClick={handleAddCustomerAccount}
              >
                <UserPlus size={17} /> Add customer account
              </button>
              <button
                type="button"
                className="profile-action-button"
                onClick={() => {
                  setProfileForm({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || ""
                  });
                  setProfileMessage("");
                  setIsEditingProfile(true);
                }}
              >
                <Pencil size={17} /> Edit details
              </button>
              <button
                type="button"
                className="profile-action-button danger"
                onClick={handleDeleteAccount}
              >
                <Trash2 size={17} /> Delete account
              </button>
            </div>

            {isEditingProfile ? (
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Phone number
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    autoComplete="tel"
                    required
                  />
                </label>
                <div className="profile-form-actions">
                  <button type="submit" className="profile-action-button primary">
                    <Save size={17} /> Save changes
                  </button>
                  <button
                    type="button"
                    className="profile-action-button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileMessage("");
                    }}
                  >
                    <X size={17} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <p><strong>Name</strong><span>{user.name || "Not available"}</span></p>
                <p><strong>Email</strong><span>{user.email || "Not available"}</span></p>
                <p><strong>Phone</strong><span>{user.phone || "Not available"}</span></p>
                <p><strong>Role</strong><span>Customer</span></p>
              </div>
            )}

            {profileMessage && (
              <p className="profile-message" role="status" aria-live="polite">
                {profileMessage}
              </p>
            )}
          </section>
        )}

      </main>
    </div>
  );
}

export default CustomerDashboard;
