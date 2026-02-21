import { Search, Filter } from "lucide-react";
import "./VehicleToolbar.css";

const VEHICLE_TYPES = ["", "TRUCK", "VAN", "BIKE"];
const VEHICLE_STATUSES = ["", "AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];

const TYPE_LABELS = { TRUCK: "Truck", VAN: "Van", BIKE: "Bike" };
const STATUS_LABELS = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

export default function VehicleToolbar({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  sortField,
  onSortFieldChange,
}) {
  return (
    <div className="v-toolbar">
      <div className="v-toolbar-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search plate, make, model..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="v-toolbar-filters">
        <div className="v-toolbar-select">
          <Filter size={14} />
          <select value={filterType} onChange={(e) => onFilterTypeChange(e.target.value)}>
            <option value="">All Types</option>
            {VEHICLE_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="v-toolbar-select">
          <Filter size={14} />
          <select value={filterStatus} onChange={(e) => onFilterStatusChange(e.target.value)}>
            <option value="">All Status</option>
            {VEHICLE_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="v-toolbar-select">
          <select value={sortField} onChange={(e) => onSortFieldChange(e.target.value)}>
            <option value="createdAt">Newest First</option>
            <option value="licensePlate">Plate A-Z</option>
            <option value="make">Make A-Z</option>
            <option value="year">Year</option>
            <option value="odometerKm">Odometer</option>
          </select>
        </div>
      </div>
    </div>
  );
}
