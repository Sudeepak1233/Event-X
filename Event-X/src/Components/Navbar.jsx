
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Menu, X, Heart, Ticket, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo" aria-label="Event-X home">
        <span className="navbar-logo-mark">
          <CalendarDays size={24} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="navbar-logo-wordmark">
          Event<span className="navbar-logo-accent">-X</span>
        </span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <div className={`navbar-links ${menuOpen ? "show-menu" : ""}`}>

        <Link to="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>

        <Link to="/events" onClick={() => setMenuOpen(false)}>
          Explore Events
        </Link>

        <Link to="/about" onClick={() => setMenuOpen(false)}>
          About
        </Link>

        <Link to="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </Link>

        {user?.role === "customer" && (
          <>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
              <Heart size={16} /> Wishlist
            </Link>
            <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
              <Ticket size={16} /> My Bookings
            </Link>
            <Link to="/customer/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          </>
        )}
        {user?.role === "organizer" && (
          <Link to="/organizer/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
        )}
        {user && user.role !== "owner" && <NotificationCenter />}
        {user ? (
          <button type="button" className="navbar-logout" onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="navbar-login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="navbar-register"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
