import "./ReportFilters.css";

export default function ReportFilters({
  vehicles,
  vehicleId,
  onVehicleChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  year,
  onYearChange,
}) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  return (
    <div className="rf-bar">
      <div className="rf-group">
        <label className="rf-label">Vehicle</label>
        <select
          className="rf-select"
          value={vehicleId}
          onChange={(e) => onVehicleChange(e.target.value)}
        >
          <option value="">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.licensePlate} ({v.make} {v.model})
            </option>
          ))}
        </select>
      </div>

      <div className="rf-group">
        <label className="rf-label">From</label>
        <input
          type="date"
          className="rf-input"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
        />
      </div>

      <div className="rf-group">
        <label className="rf-label">To</label>
        <input
          type="date"
          className="rf-input"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>

      <div className="rf-group">
        <label className="rf-label">Year</label>
        <select
          className="rf-select"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
