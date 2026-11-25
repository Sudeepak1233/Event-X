
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Event";
import EventDetails from "./pages/EventDetails";
import Payment from "./pages/Payment";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import MyBookings from "./pages/MyBookings";

// Components
import ProtectedRoute from "./Components/ProtectedRoute";

// Customer Pages
import CustomerDashboard from "./customer/CustomerDashboard";

// Organizer Pages
import OrganizerDashboard from "./organizer/OrganizerDashboard";

// Platform Owner Pages
const OwnerDashboard = lazy(() => import("./owner/OwnerDashboard"));

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Customer-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/ticket-booking/:id" element={<Payment />} />
          <Route path="/payment" element={<Payment />} />
        </Route>

        {/* Organizer Routes */}
        <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
          <Route
            path="/organizer/dashboard"
            element={<OrganizerDashboard />}
          />
        </Route>

        {/* Platform Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route
            path="/owner/dashboard"
            element={
              <Suspense
                fallback={
                  <div className="route-loading" role="status">
                    Loading dashboard...
                  </div>
                }
              >
                <OwnerDashboard />
              </Suspense>
            }
          />
        </Route>

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <h1>404 - Page Not Found</h1>
              <a href="/">Back to Home</a>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
