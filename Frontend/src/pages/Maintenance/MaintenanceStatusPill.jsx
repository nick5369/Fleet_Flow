import "./MaintenanceStatusPill.css";

export default function MaintenanceStatusPill({ status }) {
  const labels = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const cls = `msp-pill msp-pill--${status?.toLowerCase().replace("_", "-")}`;

  return <span className={cls}>{labels[status] || status}</span>;
}
