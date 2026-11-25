
import React, { useRef, useState } from "react";
import { CalendarDays, MapPin, Search, X } from "lucide-react";

import Layout from "../Components/Layout";
import EventCard from "../Components/EventCard";
import { usePublishedEvents } from "../utils/events";
import "./Event.css";

const sampleEvents = [
  {
    id: 1,
    title: "Music Festival 2026",
    category: "Music",
    description: "Enjoy an unforgettable night of live music and entertainment.",
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
    description: "Explore the latest innovations and meet technology experts.",
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
    description: "Experience exciting sports competitions and activities.",
    date: "28 Dec 2026",
    time: "4:00 PM",
    location: "Visakhapatnam",
    price: 299,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"
  },
  {
    id: 4,
    title: "Education Expo",
    category: "Education",
    description: "Discover courses, colleges and career opportunities.",
    date: "30 Dec 2026",
    time: "11:00 AM",
    location: "Vijayawada",
    price: 199,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94"
  },
  {
    id: 5,
    title: "Business Conference",
    category: "Business",
    description: "Connect with entrepreneurs and business professionals.",
    date: "05 Jan 2027",
    time: "9:30 AM",
    location: "Hyderabad",
    price: 999,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622"
  },
  {
    id: 6,
    title: "Cultural Night",
    category: "Cultural",
    description: "Celebrate culture, traditions, music and dance.",
    date: "10 Jan 2027",
    time: "5:00 PM",
    location: "Guntur",
    price: 399,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a"
  }
];

function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const searchInputRef = useRef(null);
  const allEvents = usePublishedEvents(sampleEvents);

  const filteredEvents = allEvents.filter((event) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = [
      event.title,
      event.location,
      event.description
    ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesCategory =
      category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="events-page">

        <section className="events-hero">
          <h1>Explore Events</h1>
          <p>Find exciting events and book your tickets with Event-X.</p>
        </section>

        <section className="events-container">

          <div className="events-search-panel">
            <div className="events-search-box">
              <Search size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by event name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className="events-clear-search"
                onClick={() => {
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                disabled={!search}
              >
                <X size={17} /> Clear Search
              </button>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Music">Music</option>
              <option value="Technology">Technology</option>
              <option value="Sports">Sports</option>
              <option value="Education">Education</option>
              <option value="Business">Business</option>
              <option value="Cultural">Cultural</option>
            </select>
          </div>

          <div className="events-result-heading">
            <div>
              <h2>All Events</h2>
              <p>
                <CalendarDays size={16} />
                {filteredEvents.length} events found
              </p>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="events-empty">
              <MapPin size={35} />
              <h3>No Events Found</h3>
              <p>Try changing your search or category.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

        </section>
      </div>
    </Layout>
  );
}

export default Events;
