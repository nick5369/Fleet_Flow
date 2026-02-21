import { Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import "./FuelTable.css";

const FUEL_TYPE_LABELS = {
  DIESEL: "Diesel",
  PETROL: "Petrol",
  CNG: "CNG",
  LPG: "LPG",
  ELECTRIC: "Electric",
};

export default function FuelTable({
  logs,
  loading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  getVehicleLabel,
  canWrite,
}) {
  if (loading) {
    return (
      <div className="flt-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (!logs.length) {
    return <div className="flt-empty">No fuel logs found.</div>;
  }

  return (
    <div className="flt-wrapper">
      <div className="flt-scroll">
        <table className="flt-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Fuel Type</th>
              <th>Liters</th>
              <th>Cost/L</th>
              <th>Total Cost</th>
              <th>Odometer</th>
              <th>Station</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{getVehicleLabel(log.vehicleId)}</td>
                <td>{FUEL_TYPE_LABELS[log.fuelType] || log.fuelType}</td>
                <td>{Number(log.liters).toLocaleString()}</td>
                <td>${Number(log.costPerLiter).toFixed(2)}</td>
                <td className="flt-cost">
                  ${Number(log.totalCost).toLocaleString()}
                </td>
                <td>{Number(log.odometerAtFillKm).toLocaleString()} km</td>
                <td className="flt-station">{log.stationName || "-"}</td>
                <td className="flt-date">
                  {log.filledAt
                    ? new Date(log.filledAt).toLocaleDateString()
                    : new Date(log.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="flt-actions">
                    <button
                      className="flt-action-btn"
                      onClick={() => onView(log)}
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    {canWrite && onEdit && (
                      <button
                        className="flt-action-btn"
                        onClick={() => onEdit(log)}
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flt-pagination">
          <span className="flt-page-info">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="flt-page-btns">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
