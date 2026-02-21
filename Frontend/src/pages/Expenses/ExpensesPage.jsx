import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { expenseAPI, vehicleAPI } from "../../services/api";
import { Eye } from "lucide-react";
import CostSummaryCard from "../Fuel/CostSummaryCard";
import ExpenseTable from "../Fuel/ExpenseTable";
import ExpenseDetailModal from "../Fuel/ExpenseDetailModal";
import "./ExpensesPage.css";

const EXPENSE_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "FUEL", label: "Fuel" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "TOLL", label: "Toll" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "PARKING", label: "Parking" },
  { value: "FINE", label: "Fine" },
  { value: "OTHER", label: "Other" },
];

const CAT_LABELS = {
  FUEL: "Fuel",
  MAINTENANCE: "Maintenance",
  TOLL: "Toll",
  INSURANCE: "Insurance",
  PARKING: "Parking",
  FINE: "Fine",
  OTHER: "Other",
};

export default function ExpensesPage() {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [expensePage, setExpensePage] = useState(1);
  const [expenseTotalPages, setExpenseTotalPages] = useState(1);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDetailItem, setExpenseDetailItem] = useState(null);
  const [expenseDetailLoading, setExpenseDetailLoading] = useState(false);

  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleAPI.list({ limit: 100 });
      setVehicles(res.data || []);
    } catch {
      /* silent */
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setExpenseLoading(true);
    setError("");
    try {
      const params = { page: expensePage, limit: 10 };
      if (expenseCategory) params.category = expenseCategory;
      const res = await expenseAPI.list(params);
      setExpenses(res.expenses || []);
      setExpenseTotalPages(res.pagination?.totalPages || 1);
      setExpenseTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setExpenseLoading(false);
    }
  }, [expensePage, expenseCategory]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await expenseAPI.summary({});
      setSummary(res.summary || []);
    } catch {
      setSummary([]);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchSummary();
  }, [fetchVehicles, fetchSummary]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    setExpensePage(1);
  }, [expenseCategory]);

  function getVehicleLabel(id) {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.licensePlate} (${v.make} ${v.model})` : id?.slice(0, 8);
  }

  async function viewExpenseDetail(exp) {
    setExpenseDetailLoading(true);
    try {
      const res = await expenseAPI.getById(exp.id);
      setExpenseDetailItem(res.expense);
    } catch {
      setExpenseDetailItem(exp);
    } finally {
      setExpenseDetailLoading(false);
    }
  }

  return (
    <div className="ep-container">
      <div className="ep-header">
        <div>
          <h1 className="ep-title">Expenses</h1>
          <p className="ep-subtitle">
            All operational costs -- fuel, maintenance, tolls, insurance and
            more
          </p>
        </div>
      </div>

      <CostSummaryCard
        summaryData={summary}
        vehicles={vehicles}
        loading={summaryLoading}
      />

      {error && <div className="ep-error">{error}</div>}
      <div className="ep-toolbar">
        <div className="ep-toolbar-select">
          <select
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ep-desktop-table">
        <ExpenseTable
          expenses={expenses}
          loading={expenseLoading}
          pagination={{
            page: expensePage,
            totalPages: expenseTotalPages,
            total: expenseTotal,
          }}
          onPageChange={setExpensePage}
          onView={viewExpenseDetail}
          getVehicleLabel={getVehicleLabel}
        />
      </div>

      <div className="ep-cards">
        {expenseLoading && (
          <div className="ep-empty">
            <span className="spinner" />
          </div>
        )}
        {!expenseLoading && !expenses.length && (
          <div className="ep-empty">No expenses found.</div>
        )}
        {!expenseLoading &&
          expenses.map((exp) => (
            <div key={exp.id} className="ep-card">
              <div className="ep-card-header">
                <span className="ep-card-cat">
                  {CAT_LABELS[exp.category] || exp.category}
                </span>
                <span className="ep-card-amount">
                  ${Number(exp.amount).toLocaleString()}
                </span>
              </div>
              <div className="ep-card-body">
                <div>
                  <div className="ep-card-label">Vehicle</div>
                  <div className="ep-card-value">
                    {exp.vehicleId ? getVehicleLabel(exp.vehicleId) : "-"}
                  </div>
                </div>
                <div>
                  <div className="ep-card-label">Date</div>
                  <div className="ep-card-value">
                    {exp.incurredAt
                      ? new Date(exp.incurredAt).toLocaleDateString()
                      : new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="ep-card-label">Linked To</div>
                  <div className="ep-card-value">
                    {exp.fuelLogId
                      ? "Fuel Log"
                      : exp.maintenanceLogId
                        ? "Maintenance"
                        : exp.tripId
                          ? "Trip"
                          : "-"}
                  </div>
                </div>
                <div className="ep-card-desc-wrap">
                  <div className="ep-card-label">Description</div>
                  <div className="ep-card-value">{exp.description}</div>
                </div>
              </div>
              <div className="ep-card-actions">
                <button onClick={() => viewExpenseDetail(exp)}>
                  <Eye size={14} /> View
                </button>
              </div>
            </div>
          ))}
      </div>

      {(expenseDetailItem || expenseDetailLoading) && (
        <ExpenseDetailModal
          expense={expenseDetailItem}
          loading={expenseDetailLoading}
          onClose={() => setExpenseDetailItem(null)}
          getVehicleLabel={getVehicleLabel}
        />
      )}
    </div>
  );
}
