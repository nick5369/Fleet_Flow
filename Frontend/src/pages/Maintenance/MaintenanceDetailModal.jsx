import { useState } from "react";
import { X } from "lucide-react";
import { maintenanceAPI } from "../../services/api";
import MaintenanceStatusPill from "./MaintenanceStatusPill";
import PriorityPill from "./PriorityPill";
import "./MaintenanceDetailModal.css";

const TYPE_LABELS = {
  PREVENTIVE: "Preventive",
  CORRECTIVE: "Corrective",
  INSPECTION: "Inspection",
  TIRE_CHANGE: "Tire Change",
  OTHER: "Other",
};

const EXPENSE_CATEGORIES = [
  { value: "FUEL", label: "Fuel" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "TOLL", label: "Toll" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "PARKING", label: "Parking" },
  { value: "FINE", label: "Fine" },
  { value: "OTHER", label: "Other" },
];

function Row({ label, value }) {
  return (
    <div className="mdm-row">
      <span className="mdm-label">{label}</span>
      <span className="mdm-value">{value ?? "-"}</span>
    </div>
  );
}

export default function MaintenanceDetailModal({
  log,
  loading,
  onClose,
  getVehicleLabel,
  canWrite,
  onRefresh,
}) {
  const [expenses, setExpenses] = useState([]);
  const [expensesLoaded, setExpensesLoaded] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    amount: "",
    incurredAt: "",
  });
  const [expenseError, setExpenseError] = useState("");
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  async function loadExpenses() {
    if (!log || expensesLoaded) return;
    setExpensesLoading(true);
    try {
      const res = await maintenanceAPI.listExpenses(log.id);
      setExpenses(res.data || []);
      setExpensesLoaded(true);
    } catch {
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }

  function handleToggleExpenses() {
    if (!expensesLoaded) {
      loadExpenses();
    }
  }

  function handleExpenseChange(e) {
    setExpenseForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setExpenseError("");
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setExpenseError("");

    if (!expenseForm.category) {
      setExpenseError("Category is required");
      return;
    }
    if (!expenseForm.description.trim()) {
      setExpenseError("Description is required");
      return;
    }
    if (!expenseForm.amount || Number(expenseForm.amount) < 0) {
      setExpenseError("Amount must be a positive number");
      return;
    }

    setExpenseSubmitting(true);
    try {
      const payload = {
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        amount: Number(expenseForm.amount),
      };
      if (expenseForm.incurredAt) {
        payload.incurredAt = new Date(expenseForm.incurredAt).toISOString();
      }

      await maintenanceAPI.addExpense(log.id, payload);
      setExpenseForm({
        category: "",
        description: "",
        amount: "",
        incurredAt: "",
      });
      setShowExpenseForm(false);
      setExpensesLoaded(false);
      loadExpenses();
      if (onRefresh) onRefresh();
    } catch (err) {
      setExpenseError(err.message || "Failed to add expense");
    } finally {
      setExpenseSubmitting(false);
    }
  }

  return (
    <div className="mdm-overlay" onClick={onClose}>
      <div className="mdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mdm-header">
          <h2>Maintenance Details</h2>
          <button className="mdm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading || !log ? (
          <div className="mdm-loading">
            <span className="spinner" />
          </div>
        ) : (
          <div className="mdm-body">
            <div className="mdm-section">
              <h3>General</h3>
              <Row label="Log ID" value={log.id.slice(0, 8)} />
              <Row
                label="Status"
                value={<MaintenanceStatusPill status={log.status} />}
              />
              <Row label="Vehicle" value={getVehicleLabel(log.vehicleId)} />
              <Row label="Type" value={TYPE_LABELS[log.type] || log.type} />
              <Row
                label="Priority"
                value={<PriorityPill priority={log.priority} />}
              />
            </div>

            <div className="mdm-section">
              <h3>Service Info</h3>
              <Row label="Description" value={log.description} />
              <Row
                label="Odometer"
                value={
                  log.odometerAtServiceKm != null
                    ? `${Number(log.odometerAtServiceKm).toLocaleString()} km`
                    : null
                }
              />
              <Row label="Vendor" value={log.vendorName} />
              <Row label="Invoice" value={log.invoiceNumber} />
            </div>

            <div className="mdm-section">
              <h3>Costs</h3>
              <Row
                label="Labor"
                value={
                  log.laborCost != null
                    ? `$${Number(log.laborCost).toLocaleString()}`
                    : null
                }
              />
              <Row
                label="Parts"
                value={
                  log.partsCost != null
                    ? `$${Number(log.partsCost).toLocaleString()}`
                    : null
                }
              />
              <Row
                label="Total"
                value={`$${((Number(log.laborCost) || 0) + (Number(log.partsCost) || 0)).toLocaleString()}`}
              />
            </div>

            <div className="mdm-section">
              <h3>Timeline</h3>
              <Row
                label="Scheduled"
                value={
                  log.scheduledDate
                    ? new Date(log.scheduledDate).toLocaleDateString()
                    : null
                }
              />
              <Row
                label="Created"
                value={new Date(log.createdAt).toLocaleString()}
              />
              {log.startedAt && (
                <Row
                  label="Started"
                  value={new Date(log.startedAt).toLocaleString()}
                />
              )}
              {log.completedAt && (
                <Row
                  label="Completed"
                  value={new Date(log.completedAt).toLocaleString()}
                />
              )}
            </div>

            {log.notes && (
              <div className="mdm-section">
                <h3>Notes</h3>
                <p className="mdm-notes">{log.notes}</p>
              </div>
            )}

            <div className="mdm-section">
              <div className="mdm-expense-header">
                <h3>Expenses</h3>
                <button
                  className="mdm-expense-toggle"
                  onClick={handleToggleExpenses}
                >
                  {expensesLoaded ? "Refresh" : "Load Expenses"}
                </button>
              </div>

              {expensesLoading && (
                <div className="mdm-expense-loading">
                  <span className="spinner" />
                </div>
              )}

              {expensesLoaded && !expenses.length && (
                <p className="mdm-expense-empty">No expenses recorded.</p>
              )}

              {expensesLoaded && expenses.length > 0 && (
                <div className="mdm-expense-list">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="mdm-expense-item">
                      <div className="mdm-expense-item-top">
                        <span className="mdm-expense-cat">{exp.category}</span>
                        <span className="mdm-expense-amt">
                          ${Number(exp.amount).toLocaleString()}
                        </span>
                      </div>
                      <span className="mdm-expense-desc">
                        {exp.description}
                      </span>
                      {exp.incurredAt && (
                        <span className="mdm-expense-date">
                          {new Date(exp.incurredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canWrite && !showExpenseForm && (
                <button
                  className="mdm-add-expense-btn"
                  onClick={() => {
                    setShowExpenseForm(true);
                    if (!expensesLoaded) loadExpenses();
                  }}
                >
                  Add Expense
                </button>
              )}

              {showExpenseForm && (
                <form className="mdm-expense-form" onSubmit={handleAddExpense}>
                  {expenseError && (
                    <div className="mdm-expense-error">{expenseError}</div>
                  )}
                  <div className="mdm-expense-form-row">
                    <select
                      name="category"
                      value={expenseForm.category}
                      onChange={handleExpenseChange}
                    >
                      <option value="" disabled>
                        Category
                      </option>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseChange}
                    />
                  </div>
                  <input
                    name="description"
                    placeholder="Description"
                    value={expenseForm.description}
                    onChange={handleExpenseChange}
                  />
                  <input
                    name="incurredAt"
                    type="date"
                    value={expenseForm.incurredAt}
                    onChange={handleExpenseChange}
                  />
                  <div className="mdm-expense-form-actions">
                    <button
                      type="button"
                      onClick={() => setShowExpenseForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="mdm-expense-submit"
                      disabled={expenseSubmitting}
                    >
                      {expenseSubmitting ? <span className="spinner" /> : "Add"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
