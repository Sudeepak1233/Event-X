# React + Vite

## Running the app and owner access

The development command starts both the Vite frontend and the API server:

```sh
npm run dev
```

The single Platform Owner account is provisioned from server-only values in
`.env.local`; use `.env.example` as a template. The server stores a salted
password hash in SQLite and issues an HTTP-only session cookie. Owner event
approval and denial are checked by the API, not by browser storage.

Customer and organizer accounts still use the frontend demo flow and
localStorage. Organizer event submission is saved by the API for owner review,
but organizer authentication is not yet server-backed. Do not treat those
roles or their data as production-secure.

## Customer features

Events, event details, ratings, and reviews are public. Booking checkout,
customer dashboards, wishlists, and booking history require a customer login.
After checkout, each booking is saved in the existing `eventXBookings`
LocalStorage collection and is shown only to the matching signed-in email.

The frontend stores wishlist entries, event reviews, and user-scoped
notifications in `eventXWishlist`, `eventXReviews`, and
`eventXNotifications`. The shared auth and application-data contexts are
initialized from those browser-local collections; they are demo storage, not a
secure multi-device account store.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
