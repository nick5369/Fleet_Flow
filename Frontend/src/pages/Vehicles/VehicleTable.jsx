import { Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import "./VehicleTable.css";

const STATUS_LABELS = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

const TYPE_LABELS = { TRUCK: "Truck", VAN: "Van", BIKE: "Bike" };

export default function VehicleTable({
  vehicles,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView,
  isManager,
}) {
  if (loading) {
    return <div className="vt-empty"><span className="spinner" /></div>;
  }

  if (!vehicles.length) {
    return <div className="vt-empty">No vehicles found.</div>;
  }

  return (
    <div className="vt-wrapper">
      <div className="vt-scroll">
        <table className="vt-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Plate</th>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>Type</th>
              <th>Max Load (kg)</th>
              <th>Odometer (km)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, i) => (
              <tr key={v.id}>
                <td className="vt-num">
                  {(pagination.page - 1) * pagination.limit + i + 1}
                </td>
                <td className="vt-plate">{v.licensePlate}</td>
                <td>{v.make}</td>
                <td>{v.model}</td>
                <td>{v.year}</td>
                <td>{TYPE_LABELS[v.vehicleType] || v.vehicleType}</td>
                <td>{Number(v.maxLoadKg).toLocaleString()}</td>
                <td>{Number(v.odometerKm).toLocaleString()}</td>
                <td>
                  <span className={`vt-status vt-status--${v.status.toLowerCase().replace("_", "-")}`}>
                    {STATUS_LABELS[v.status] || v.status}
                  </span>
                </td>
                {isManager && (
                  <td>
                    <div className="vt-actions">
                      <button className="vt-action-btn" onClick={() => onView(v)} title="View Details">
                        <Eye size={15} />
                      </button>
                      <button className="vt-action-btn" onClick={() => onEdit(v)} title="Edit">
                        <Edit size={15} />
                      </button>
                    </div>
                  </td>
                )}
                {!isManager && (
                  <td>
                    <button className="vt-action-btn" onClick={() => onView(v)} title="View Details">
                      <Eye size={15} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="vt-pagination">
          <span className="vt-page-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="vt-page-btns">
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
