import { X } from "lucide-react";
import "./ExpenseDetailModal.css";

const CATEGORY_LABELS = {
  FUEL: "Fuel",
  MAINTENANCE: "Maintenance",
  TOLL: "Toll",
  INSURANCE: "Insurance",
  PARKING: "Parking",
  FINE: "Fine",
  OTHER: "Other",
};

function Row({ label, value }) {
  return (
    <div className="exd-row">
      <span className="exd-label">{label}</span>
      <span className="exd-value">{value ?? "-"}</span>
    </div>
  );
}

export default function ExpenseDetailModal({
  expense,
  loading,
  onClose,
  getVehicleLabel,
}) {
  return (
    <div className="exd-overlay" onClick={onClose}>
      <div className="exd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exd-header">
          <h2>Expense Details</h2>
          <button className="exd-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading || !expense ? (
          <div className="exd-loading">
            <span className="spinner" />
          </div>
        ) : (
          <div className="exd-body">
            <div className="exd-section">
              <h3>General</h3>
              <Row label="Expense ID" value={expense.id.slice(0, 8)} />
              <Row
                label="Category"
                value={CATEGORY_LABELS[expense.category] || expense.category}
              />
              <Row label="Description" value={expense.description} />
              <Row
                label="Amount"
                value={`$${Number(expense.amount).toLocaleString()}`}
              />
            </div>

            <div className="exd-section">
              <h3>Associations</h3>
              <Row
                label="Vehicle"
                value={
                  expense.vehicleId ? getVehicleLabel(expense.vehicleId) : null
                }
              />
              <Row
                label="Linked To"
                value={
                  expense.fuelLogId
                    ? `Fuel Log (${expense.fuelLogId.slice(0, 8)})`
                    : expense.maintenanceLogId
                      ? `Maintenance (${expense.maintenanceLogId.slice(0, 8)})`
                      : expense.tripId
                        ? `Trip (${expense.tripId.slice(0, 8)})`
                        : null
                }
              />
            </div>

            <div className="exd-section">
              <h3>Timeline</h3>
              <Row
                label="Incurred"
                value={
                  expense.incurredAt
                    ? new Date(expense.incurredAt).toLocaleString()
                    : null
                }
              />
              <Row
                label="Created"
                value={new Date(expense.createdAt).toLocaleString()}
              />
            </div>

            {expense.receiptUrl && (
              <div className="exd-section">
                <h3>Receipt</h3>
                <Row label="URL" value={expense.receiptUrl} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
