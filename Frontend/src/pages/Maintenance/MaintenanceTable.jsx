import {
  Eye,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MaintenanceStatusPill from "./MaintenanceStatusPill";
import PriorityPill from "./PriorityPill";
import "./MaintenanceTable.css";

const TYPE_LABELS = {
  PREVENTIVE: "Preventive",
  CORRECTIVE: "Corrective",
  INSPECTION: "Inspection",
  TIRE_CHANGE: "Tire Change",
  OTHER: "Other",
};

export default function MaintenanceTable({
  logs,
  loading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onStart,
  onComplete,
  onCancel,
  getVehicleLabel,
  canWrite,
}) {
  if (loading) {
    return (
      <div className="mnt-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (!logs.length) {
    return <div className="mnt-empty">No maintenance logs found.</div>;
  }

  function formatCost(labor, parts) {
    const total = (Number(labor) || 0) + (Number(parts) || 0);
    return total > 0 ? `$${total.toLocaleString()}` : "-";
  }

  return (
    <div className="mnt-wrapper">
      <div className="mnt-scroll">
        <table className="mnt-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="mnt-log-id">{log.id.slice(0, 8)}</td>
                <td>{getVehicleLabel(log.vehicleId)}</td>
                <td>{TYPE_LABELS[log.type] || log.type}</td>
                <td>
                  <PriorityPill priority={log.priority} />
                </td>
                <td className="mnt-desc">{log.description}</td>
                <td>{formatCost(log.laborCost, log.partsCost)}</td>
                <td className="mnt-date">
                  {new Date(log.scheduledDate).toLocaleDateString()}
                </td>
                <td>
                  <MaintenanceStatusPill status={log.status} />
                </td>
                <td>
                  <div className="mnt-actions">
                    <button
                      className="mnt-action-btn"
                      onClick={() => onView(log)}
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    {canWrite &&
                      (log.status === "SCHEDULED" ||
                        log.status === "IN_PROGRESS") &&
                      onEdit && (
                        <button
                          className="mnt-action-btn"
                          onClick={() => onEdit(log)}
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                      )}
                    {canWrite && log.status === "SCHEDULED" && onStart && (
                      <button
                        className="mnt-action-btn mnt-action-btn--start"
                        onClick={() => onStart(log)}
                        title="Start"
                      >
                        <Play size={15} />
                      </button>
                    )}
                    {canWrite && log.status === "IN_PROGRESS" && onComplete && (
                      <button
                        className="mnt-action-btn"
                        onClick={() => onComplete(log)}
                        title="Complete"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {canWrite &&
                      (log.status === "SCHEDULED" ||
                        log.status === "IN_PROGRESS") &&
                      onCancel && (
                        <button
                          className="mnt-action-btn"
                          onClick={() => onCancel(log)}
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
        <div className="mnt-pagination">
          <span className="mnt-page-info">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="mnt-page-btns">
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
