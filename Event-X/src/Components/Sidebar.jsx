
import React from "react";
import { NavLink, Link } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Ticket,
  Users,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle,
  UserCog,
  X
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ role = "customer", isOpen = true, onClose }) {

  const menuItems = {

    customer: [
      {
        name: "Dashboard",
        path: "/customer/dashboard",
        icon: <LayoutDashboard />
      },
      {
        name: "Explore Events",
        path: "/events",
        icon: <CalendarDays />
      },
      {
        name: "My Bookings",
        path: "/customer/bookings",
        icon: <CheckCircle />
      },
      {
        name: "My Tickets",
        path: "/customer/tickets",
        icon: <Ticket />
      }
    ],

    organizer: [
      {
        name: "Dashboard",
        path: "/organizer/dashboard",
        icon: <LayoutDashboard />
      },
      {
        name: "Create Event",
        path: "/organizer/create-event",
        icon: <PlusCircle />
      },
      {
        name: "My Events",
        path: "/organizer/events",
        icon: <CalendarDays />
      },
      {
        name: "Registrations",
        path: "/organizer/registrations",
        icon: <Users />
      },
      {
        name: "Analytics",
        path: "/organizer/analytics",
        icon: <BarChart3 />
      }
    ],

    owner: [
      {
        name: "Dashboard",
        path: "/owner/dashboard",
        icon: <LayoutDashboard />
      },
      {
        name: "Manage Organizers",
        path: "/owner/organizers",
        icon: <UserCog />
      },
      {
        name: "Manage Events",
        path: "/owner/events",
        icon: <CalendarDays />
      },
      {
        name: "Approvals",
        path: "/owner/approvals",
        icon: <CheckCircle />
      },
      {
        name: "Manage Bookings",
        path: "/owner/bookings",
        icon: <Ticket />
      }
    ]

  };

  const items = menuItems[role] || menuItems.customer;

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

        <div className="sidebar-header">

          <Link to="/" className="sidebar-logo">
            <CalendarDays size={27} />
            <h2>Event-X</h2>
          </Link>

          <button
            className="sidebar-close"
            onClick={onClose}
          >
            <X />
          </button>

        </div>

        <div className="sidebar-role">
          {role.toUpperCase()} PANEL
        </div>

        <nav className="sidebar-menu">

          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.endsWith("/dashboard")}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <NavLink
            to="/settings"
            className="sidebar-link"
            onClick={onClose}
          >
            <Settings />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/login"
            className="sidebar-link logout-link"
            onClick={onClose}
          >
            <LogOut />
            <span>Logout</span>
          </NavLink>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;
