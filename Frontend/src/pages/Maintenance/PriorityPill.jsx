import "./PriorityPill.css";

export default function PriorityPill({ priority }) {
  const labels = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  };

  const cls = `pp-pill pp-pill--${priority?.toLowerCase()}`;

  return <span className={cls}>{labels[priority] || priority}</span>;
}
