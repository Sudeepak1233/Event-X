import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { appReducer } from "../utils/appReducer";

const AppDataContext = createContext(null);

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return [];
  }
}

const initialState = {
  wishlist: readArray("eventXWishlist"),
  bookings: readArray("eventXBookings"),
  reviews: readArray("eventXReviews"),
  notifications: readArray("eventXNotifications")
};

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem("eventXWishlist", JSON.stringify(state.wishlist));
      localStorage.setItem("eventXBookings", JSON.stringify(state.bookings));
      localStorage.setItem("eventXReviews", JSON.stringify(state.reviews));
      localStorage.setItem("eventXNotifications", JSON.stringify(state.notifications));
    } catch (error) {
      console.error("Could not persist Event-X application data.", error);
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider.");
  }
  return context;
}
