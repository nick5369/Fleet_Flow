import { Search, Filter } from "lucide-react";
import "./MaintenanceToolbar.css";

const STATUSES = [
  { value: "", label: "All Status" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const TYPES = [
  { value: "", label: "All Types" },
  { value: "PREVENTIVE", label: "Preventive" },
  { value: "CORRECTIVE", label: "Corrective" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "TIRE_CHANGE", label: "Tire Change" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "", label: "All Priority" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function MaintenanceToolbar({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
  filterPriority,
  onFilterPriorityChange,
}) {
  return (
    <div className="mtb-toolbar">
      <div className="mtb-toolbar-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search description, vendor..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="mtb-toolbar-filters">
        <div className="mtb-toolbar-select">
          <Filter size={14} />
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mtb-toolbar-select">
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mtb-toolbar-select">
          <select
            value={filterPriority}
            onChange={(e) => onFilterPriorityChange(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
