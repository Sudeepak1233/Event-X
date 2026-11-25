import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../Components/Layout";
import EventCard from "../Components/EventCard";
import { useAuth, normalizeEmail } from "../contexts/AuthContext";
import { useAppData } from "../contexts/AppDataContext";
import "./CustomerFeatures.css";

function Wishlist() {
  const { user } = useAuth();
  const { state } = useAppData();
  const email = normalizeEmail(user?.email);
  const savedEvents = state.wishlist
    .filter((item) => normalizeEmail(item.userEmail) === email)
    .map((item) => item.event)
    .filter(Boolean);

  return (
    <Layout>
      <main className="customer-feature-page">
        <div className="customer-feature-heading">
          <span className="customer-feature-icon"><Heart size={23} /></span>
          <div>
            <h1>My Wishlist</h1>
            <p>Your saved events, all in one place.</p>
          </div>
        </div>

        {savedEvents.length ? (
          <div className="events-grid">
            {savedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <section className="customer-feature-empty">
            <Heart size={38} />
            <h2>Your wishlist is empty</h2>
            <p>Save events you love and come back to them anytime.</p>
            <Link to="/events" className="customer-feature-button">Explore Events</Link>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Wishlist;
