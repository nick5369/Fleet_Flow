import "./StatusPill.css";

export default function StatusPill({ status }) {
  const labels = {
    DRAFT: "Draft",
    DISPATCHED: "Dispatched",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const cls = `sp-pill sp-pill--${status?.toLowerCase()}`;

  return <span className={cls}>{labels[status] || status}</span>;
}
