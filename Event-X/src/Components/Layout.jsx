
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({
  children,
  showNavbar = true,
  showFooter = true
}) {
  return (
    <div className="app-layout">

      {showNavbar && <Navbar />}

      <main className="main-content">
        {children}
      </main>

      {showFooter && <Footer />}

    </div>
  );
}

export default Layout;
