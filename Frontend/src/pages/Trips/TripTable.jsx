import {
  Eye,
  Send,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusPill from "./StatusPill";
import "./TripTable.css";

export default function TripTable({
  trips,
  loading,
  pagination,
  onPageChange,
  onView,
  onDispatch,
  onComplete,
  onCancel,
  getVehicleLabel,
  getDriverLabel,
  canWrite,
}) {
  if (loading) {
    return (
      <div className="trt-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (!trips.length) {
    return <div className="trt-empty">No trips found.</div>;
  }

  return (
    <div className="trt-wrapper">
      <div className="trt-scroll">
        <table className="trt-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <td className="trt-trip-number">{t.tripNumber}</td>
                <td>{getVehicleLabel(t.vehicleId)}</td>
                <td>{getDriverLabel(t.driverId)}</td>
                <td>{Number(t.cargoWeightKg).toLocaleString()}</td>
                <td className="trt-address">{t.originAddress}</td>
                <td className="trt-address">{t.destinationAddress}</td>
                <td>
                  <StatusPill status={t.status} />
                </td>
                <td className="trt-date">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="trt-actions">
                    <button
                      className="trt-action-btn"
                      onClick={() => onView(t)}
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    {canWrite && t.status === "DRAFT" && onDispatch && (
                      <button
                        className="trt-action-btn trt-action-btn--dispatch"
                        onClick={() => onDispatch(t)}
                        title="Dispatch"
                      >
                        <Send size={15} />
                      </button>
                    )}
                    {canWrite && t.status === "DISPATCHED" && onComplete && (
                      <button
                        className="trt-action-btn"
                        onClick={() => onComplete(t)}
                        title="Complete"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {canWrite &&
                      (t.status === "DRAFT" || t.status === "DISPATCHED") &&
                      onCancel && (
                        <button
                          className="trt-action-btn"
                          onClick={() => onCancel(t)}
                          title="Cancel"
                        >
                          <XCircle size={15} />
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
        <div className="trt-pagination">
          <span className="trt-page-info">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="trt-page-btns">
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
