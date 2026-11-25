
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import Layout from "../Components/Layout";
import { toPublicUser, verifyPassword } from "../utils/auth";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const emailInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [selectedAccountEmail, setSelectedAccountEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const accountStorageKeys = {
    customer: "eventXCustomers",
    organizer: "eventXOrganizers",
    owner: "eventXOwners"
  };
  const availableAccounts = JSON.parse(
    localStorage.getItem(accountStorageKeys[role]) || "[]"
  );
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (e.target.name === "email") {
      setSelectedAccountEmail("");
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedAccountEmail("");
    setFormData({
      ...formData,
      email: ""
    });
  };

  const handleAccountChange = (e) => {
    const accountEmail = e.target.value;
    setSelectedAccountEmail(accountEmail);
    const account = availableAccounts.find(
      (item) =>
        String(item.email || "").trim().toLowerCase() === accountEmail
    );

    setFormData({
      ...formData,
      email: account?.email || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter your email and password.");
      return;
    }

    if (role === "owner") {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          alert(response.status === 401
            ? "Invalid email or password."
            : "Owner sign-in is temporarily unavailable.");
          return;
        }

        const { user } = await response.json();
        setUser(user);
        navigate("/owner/dashboard");
      } catch (error) {
        console.error("Owner sign-in request failed.", error);
        alert("Owner sign-in service is unavailable. Please try again.");
      }
      return;
    }

    const account = availableAccounts.find(
      (item) =>
        String(item.email || "").trim().toLowerCase() ===
        formData.email.trim().toLowerCase()
    );

    let passwordMatches = false;
    try {
      passwordMatches = account
        ? await verifyPassword(formData.password, account)
        : false;
    } catch (error) {
      console.error("Password verification failed.", error);
      alert("Unable to verify your password in this browser.");
      return;
    }

    if (!passwordMatches) {
      alert("Invalid email or password.");
      return;
    }

    const user = toPublicUser({ ...account, role });
    setUser(user);

    if (role === "customer") {
      const returnPath = location.state?.from;
      const canReturn =
        returnPath?.startsWith("/ticket-booking/") ||
        returnPath?.startsWith("/my-bookings") ||
        returnPath?.startsWith("/wishlist") ||
        returnPath?.startsWith("/customer/") ||
        returnPath?.startsWith("/events/");
      navigate(canReturn ? returnPath : "/customer/dashboard", { replace: true });
    } else if (role === "organizer") {
      navigate("/organizer/dashboard");
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="login-page">
        <div className="login-card">

          <div className="login-icon">
            <LogIn size={32} />
          </div>

          <h1>Welcome Back!</h1>
          <p className="login-subtitle">
            Login to continue your Event-X journey.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>Email Address</label>
              <div className="login-input">
                <Mail size={19} />
                <input
                  type="email"
                  name="email"
                  ref={emailInputRef}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <div className="login-input">
                <Lock size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="login-input-group">
              <label>Select Login Role</label>
              <select
                value={role}
                onChange={handleRoleChange}
                required
              >
                <option value="customer">Customer</option>
                <option value="organizer">Event Organizer</option>
                <option value="owner">Platform Owner</option>
              </select>
            </div>

            {role !== "owner" && availableAccounts.length > 0 && (
              <div className="login-input-group">
                <label htmlFor="saved-account">
                  Switch to a saved {role} account
                </label>
                <select
                  id="saved-account"
                  value={selectedAccountEmail}
                  onChange={handleAccountChange}
                >
                  <option value="">Select an account</option>
                  {availableAccounts.map((account) => (
                    <option
                      key={account.email}
                      value={String(account.email || "").trim().toLowerCase()}
                    >
                      {account.name || account.email} — {account.email}
                    </option>
                  ))}
                </select>
                <small className="saved-account-help">
                  Selecting an account fills its email so you can switch to it.
                </small>
              </div>
            )}

            <button type="submit" className="login-submit">
              Login Now
            </button>
          </form>

          <p className="register-link">
            Don't have an account? <Link to="/register" state={{ from: location.state?.from }}>Register Now</Link>
          </p>

          <Link to="/" className="back-home">
            Back to Home
          </Link>

        </div>
      </div>
    </Layout>
  );
}

export default Login;
