import { Search, Filter } from "lucide-react";
import "./TripToolbar.css";

const TRIP_STATUSES = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function TripToolbar({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}) {
  return (
    <div className="tt-toolbar">
      <div className="tt-toolbar-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search trip number, origin, destination..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="tt-toolbar-filters">
        <div className="tt-toolbar-select">
          <Filter size={14} />
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
          >
            {TRIP_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
