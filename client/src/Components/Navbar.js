
import React, { useContext, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Usercontext } from "../App";

export default function NavBar() {
  const { state, dispatch } = useContext(Usercontext);
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar sirf logged-in user ko dikhana hai.
  useEffect(() => {
    document.body.classList.toggle("has-sidebar", Boolean(state));

    return () => {
      document.body.classList.remove("has-sidebar");
    };
  }, [state]);

  // Logout par session clear karke login page par bhejna hai.
  function handleLogout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    dispatch({ type: "CLEAR" });
    navigate("/login");
  }

  // Active page ke link ko alag styling deni hai.
  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  // Login aur signup pages par navigation nahi dikhani.
  if (!state || !localStorage.getItem("jwt")) {
    return null;
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="app-sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-icon">◎</span>
          <span>Instagram</span>
        </NavLink>

        <nav className="nav-menu">
          <NavLink to="/" end className={linkClass}>
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </NavLink>

          <NavLink to="/myfollowerspost" className={linkClass}>
            <span className="nav-icon">♡</span>
            <span>Following</span>
          </NavLink>

          <NavLink to="/create" className={linkClass}>
            <span className="nav-icon">＋</span>
            <span>Create</span>
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            <span className="nav-icon">◉</span>
            <span>Profile</span>
          </NavLink>
        </nav>

        <button className="nav-logout" onClick={handleLogout}>
          <span className="nav-icon">⇥</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile top header */}
      <header className="mobile-header">
        <NavLink to="/" className="brand">
          <span className="brand-icon">◎</span>
          <span>Instagram</span>
        </NavLink>

        <button className="mobile-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={linkClass}>
          <span className="nav-icon">⌂</span>
          <span>Home</span>
        </NavLink>

        <NavLink to="/myfollowerspost" className={linkClass}>
          <span className="nav-icon">♡</span>
          <span>Following</span>
        </NavLink>

        <NavLink to="/create" className={linkClass}>
          <span className="nav-icon">＋</span>
          <span>Create</span>
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <span className="nav-icon">◉</span>
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
}
