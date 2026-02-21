import { Search, Filter } from "lucide-react";
import "./DriverToolbar.css";

const DRIVER_STATUSES = [
  { value: "", label: "All Status" },
  { value: "ON_DUTY", label: "On Duty" },
  { value: "OFF_DUTY", label: "Off Duty" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ON_TRIP", label: "On Trip" },
];

const LICENSE_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "BIKE", label: "Bike" },
];

export default function DriverToolbar({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
}) {
  return (
    <div className="dt-toolbar">
      <div className="dt-toolbar-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search name, employee ID, email, license..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="dt-toolbar-filters">
        <div className="dt-toolbar-select">
          <Filter size={14} />
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
          >
            {DRIVER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="dt-toolbar-select">
          <Filter size={14} />
          <select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value)}
          >
            {LICENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
