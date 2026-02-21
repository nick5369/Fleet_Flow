import { useAuth } from "../../context/AuthContext";
import { getNavForRole } from "../../config/navigation";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./Dashboard.css";

const ROLE_LABELS = {
  MANAGER: "Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCE_ANALYST: "Finance Analyst",
};

export default function Dashboard() {
  const { user } = useAuth();
  const modules = getNavForRole(user?.role).filter((n) => n.key !== "dashboard");

  return (
    <div className="dash">
      <header className="dash-header">
        <h1>Welcome back, {user?.name}</h1>
        <span className="dash-role-badge">{ROLE_LABELS[user?.role] || user?.role}</span>
      </header>

      <section className="dash-section">
        <h2 className="dash-section-title">Modules</h2>
        <div className="dash-grid">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.key} to={item.path} className="dash-tile">
                <div className="dash-tile-top">
                  <div className="dash-tile-icon">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <ArrowUpRight size={16} className="dash-tile-arrow" />
                </div>
                <h3 className="dash-tile-label">{item.label}</h3>
                <p className="dash-tile-desc">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
