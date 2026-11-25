import eventPlaceholder from "../assets/hero.png";
import { useEffect, useState } from "react";

export function getPublishedEvents(sampleEvents) {
  const organizerEvents = JSON.parse(
    localStorage.getItem("organizerEvents") || "[]"
  );
  const approvedEventIds = JSON.parse(
    localStorage.getItem("approvedEvents") || "[]"
  );

  return [
    ...sampleEvents,
    ...organizerEvents
      .filter((event) => approvedEventIds.includes(event.id))
      .map((event) => ({
        ...event,
        image: event.image || eventPlaceholder
      }))
  ];
}

export function usePublishedEvents(sampleEvents) {
  const [events, setEvents] = useState(() => getPublishedEvents(sampleEvents));

  useEffect(() => {
    let active = true;
    fetch("/api/events")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Event request failed with status ${response.status}.`);
        }
        return response.json();
      })
      .then(({ events: publishedEvents }) => {
        if (!active) return;

        const mergedEvents = new Map(
          getPublishedEvents(sampleEvents).map((event) => [String(event.id), event])
        );
        publishedEvents.forEach((event) => {
          mergedEvents.set(String(event.id), {
            ...event,
            image: event.image || eventPlaceholder
          });
        });
        setEvents(Array.from(mergedEvents.values()));
      })
      .catch((error) => {
        console.error("Could not load approved events from the server.", error);
      });

    return () => {
      active = false;
    };
  }, [sampleEvents]);

  return events;
}
