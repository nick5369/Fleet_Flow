import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getNavForRole } from "../../config/navigation";
import { Sun, Moon, LogOut, Menu, X, Truck } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavForRole(user?.role);

  function handleLogout() {
    setMobileOpen(false);
    logout();
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/dashboard" className="navbar-brand" onClick={() => setMobileOpen(false)}>
            <Truck size={24} strokeWidth={1.5} />
            <span>FleetFlow</span>
          </Link>

          <div className={`navbar-center ${mobileOpen ? "open" : ""}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`nav-link ${active ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="mobile-footer">
              <div className="nav-user-info">
                <span className="nav-user-name">{user?.name}</span>
                <span className="nav-user-role">{user?.role?.replace("_", " ")}</span>
              </div>
              <button className="nav-icon-btn logout-btn-mobile" onClick={handleLogout} title="Sign out">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="navbar-right">
            <div className="nav-user-info">
              <span className="nav-user-name">{user?.name}</span>
              <span className="nav-user-role">{user?.role?.replace("_", " ")}</span>
            </div>
            <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="nav-icon-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={18} />
            </button>
          </div>

          <div className="navbar-right-mobile">
            <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="nav-icon-btn hamburger"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
