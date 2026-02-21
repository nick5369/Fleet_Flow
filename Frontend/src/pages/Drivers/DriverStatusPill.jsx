import "./DriverStatusPill.css";

const LABELS = {
  ON_DUTY: "On Duty",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
  ON_TRIP: "On Trip",
};

export default function DriverStatusPill({ status }) {
  const cls = `dsp-pill dsp-pill--${status?.toLowerCase().replace("_", "-")}`;
  return <span className={cls}>{LABELS[status] || status}</span>;
}
