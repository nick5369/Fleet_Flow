import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import "./ExpenseTable.css";

const CATEGORY_LABELS = {
  FUEL: "Fuel",
  MAINTENANCE: "Maintenance",
  TOLL: "Toll",
  INSURANCE: "Insurance",
  PARKING: "Parking",
  FINE: "Fine",
  OTHER: "Other",
};

export default function ExpenseTable({
  expenses,
  loading,
  pagination,
  onPageChange,
  onView,
  getVehicleLabel,
}) {
  if (loading) {
    return (
      <div className="ext-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (!expenses.length) {
    return <div className="ext-empty">No expenses found.</div>;
  }

  return (
    <div className="ext-wrapper">
      <div className="ext-scroll">
        <table className="ext-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Linked To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.vehicleId ? getVehicleLabel(exp.vehicleId) : "-"}</td>
                <td>
                  <span className="ext-cat">
                    {CATEGORY_LABELS[exp.category] || exp.category}
                  </span>
                </td>
                <td className="ext-desc">{exp.description}</td>
                <td className="ext-amount">
                  ${Number(exp.amount).toLocaleString()}
                </td>
                <td className="ext-date">
                  {exp.incurredAt
                    ? new Date(exp.incurredAt).toLocaleDateString()
                    : new Date(exp.createdAt).toLocaleDateString()}
                </td>
                <td className="ext-linked">
                  {exp.fuelLogId
                    ? "Fuel Log"
                    : exp.maintenanceLogId
                      ? "Maintenance"
                      : exp.tripId
                        ? "Trip"
                        : "-"}
                </td>
                <td>
                  <div className="ext-actions">
                    <button
                      className="ext-action-btn"
                      onClick={() => onView(exp)}
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="ext-pagination">
          <span className="ext-page-info">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="ext-page-btns">
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
