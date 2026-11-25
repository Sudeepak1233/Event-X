import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { normalizeEmail, useAuth } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import "./NotificationCenter.css";

function NotificationCenter() {
  const { user } = useAuth();
  const { state, dispatch } = useAppData();
  const [open, setOpen] = useState(false);
  const email = normalizeEmail(user?.email);
  const notifications = state.notifications.filter(
    (notification) => normalizeEmail(notification.userEmail) === email
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markRead = (id) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", id, userEmail: email });
  };

  return (
    <div className="notification-center">
      <button
        type="button"
        className="notification-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell size={19} />
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {open && (
        <section className="notification-panel" aria-label="Notifications">
          <div className="notification-panel-heading">
            <div>
              <h2>Notifications</h2>
              <span>{unreadCount} unread</span>
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                className="notification-clear"
                onClick={() => dispatch({ type: "CLEAR_NOTIFICATIONS", userEmail: email })}
              >
                <Trash2 size={14} /> Clear all
              </button>
            )}
          </div>

          {notifications.length ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <article
                  className={`notification-item ${notification.read ? "is-read" : ""}`}
                  key={notification.id}
                >
                  <div className="notification-item-copy">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <time dateTime={notification.createdAt}>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : ""}
                    </time>
                    {notification.link && (
                      <Link
                        to={notification.link}
                        onClick={() => {
                          markRead(notification.id);
                          setOpen(false);
                        }}
                      >
                        View
                      </Link>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      className="notification-mark-read"
                      onClick={() => markRead(notification.id)}
                      aria-label={`Mark ${notification.title} as read`}
                    >
                      <Check size={16} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="notification-empty">You're all caught up.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default NotificationCenter;
