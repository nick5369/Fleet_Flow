import "./CompliancePill.css";

export default function CompliancePill({ expired }) {
  const cls = expired ? "cp-pill cp-pill--expired" : "cp-pill cp-pill--valid";
  return <span className={cls}>{expired ? "Expired" : "Valid"}</span>;
}
