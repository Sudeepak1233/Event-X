
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserPlus
} from "lucide-react";

import Layout from "../Components/Layout";
import { createPasswordCredential, toPublicUser } from "../utils/auth";
import { useAuth } from "../contexts/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (!["customer", "organizer"].includes(formData.role)) {
      alert("Platform Owner accounts cannot be created through public registration.");
      return;
    }

    const accountStorageKeys = {
      customer: "eventXCustomers",
      organizer: "eventXOrganizers"
    };
    const storageKey = accountStorageKeys[formData.role];
    const registeredAccounts = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );
    const normalizedEmail = formData.email.trim().toLowerCase();
    const alreadyExists = registeredAccounts.some(
      (account) => account.email?.trim().toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      alert(`This ${formData.role} email is already registered.`);
      return;
    }

    const account = {
      name: formData.name,
      email: formData.email.trim(),
      phone: formData.phone,
      role: formData.role
    };
    let credential;
    try {
      credential = await createPasswordCredential(formData.password);
    } catch (error) {
      console.error("Password credential creation failed.", error);
      alert("Unable to create a password credential in this browser.");
      return;
    }
    registeredAccounts.push({ ...account, ...credential });
    localStorage.setItem(storageKey, JSON.stringify(registeredAccounts));

    const user = toPublicUser(account);
    setUser(user);

    alert("Registration successful!");

    if (formData.role === "customer") {
      const returnPath = location.state?.from;
      const canReturn =
        returnPath?.startsWith("/ticket-booking/") ||
        returnPath?.startsWith("/my-bookings") ||
        returnPath?.startsWith("/wishlist") ||
        returnPath?.startsWith("/customer/") ||
        returnPath?.startsWith("/events/");
      navigate(canReturn ? returnPath : "/customer/dashboard", { replace: true });
    } else if (formData.role === "organizer") {
      navigate("/organizer/dashboard");
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="register-page">
        <div className="register-card">

          <div className="register-icon">
            <UserPlus size={32} />
          </div>

          <h1>Create Account</h1>
          <p className="register-subtitle">
            Join Event-X and explore amazing opportunities.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="register-input-group">
              <label>Full Name</label>
              <div className="register-input">
                <User size={19} />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label>Email Address</label>
              <div className="register-input">
                <Mail size={19} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label>Phone Number</label>
              <div className="register-input">
                <Phone size={19} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label>Password</label>
              <div className="register-input">
                <Lock size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="register-input-group">
              <label>Register As</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>

            <button type="submit" className="register-submit">
              Create Account
            </button>

          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Login Now</Link>
          </p>

          <Link to="/" className="register-back-home">
            Back to Home
          </Link>

        </div>
      </div>
    </Layout>
  );
}

export default Register;
