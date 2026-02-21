import "./CostSummaryCard.css";

export default function CostSummaryCard({ summaryData, vehicles, loading }) {
  if (loading) {
    return (
      <div className="csc-loading">
        <span className="spinner" />
      </div>
    );
  }

  if (!summaryData || !summaryData.length) {
    return null;
  }

  const fuelEntry = summaryData.find((s) => s.category === "FUEL");
  const maintenanceEntry = summaryData.find(
    (s) => s.category === "MAINTENANCE",
  );

  const otherCategories = summaryData.filter(
    (s) => s.category !== "FUEL" && s.category !== "MAINTENANCE",
  );

  const totalFuel = fuelEntry ? Number(fuelEntry.totalAmount) : 0;
  const totalMaintenance = maintenanceEntry
    ? Number(maintenanceEntry.totalAmount)
    : 0;
  const totalOther = otherCategories.reduce(
    (sum, e) => sum + Number(e.totalAmount || 0),
    0,
  );
  const grandTotal = totalFuel + totalMaintenance + totalOther;

  return (
    <div className="csc-container">
      <h3 className="csc-heading">Cost Overview</h3>
      <div className="csc-grid">
        <div className="csc-card">
          <span className="csc-card-label">Fuel Cost</span>
          <span className="csc-card-value">${totalFuel.toLocaleString()}</span>
          {fuelEntry && (
            <span className="csc-card-count">{fuelEntry.count} entries</span>
          )}
        </div>

        <div className="csc-card">
          <span className="csc-card-label">Maintenance Cost</span>
          <span className="csc-card-value">
            ${totalMaintenance.toLocaleString()}
          </span>
          {maintenanceEntry && (
            <span className="csc-card-count">
              {maintenanceEntry.count} entries
            </span>
          )}
        </div>

        <div className="csc-card">
          <span className="csc-card-label">Other Expenses</span>
          <span className="csc-card-value">${totalOther.toLocaleString()}</span>
          <span className="csc-card-count">
            {otherCategories.reduce((s, e) => s + (e.count || 0), 0)} entries
          </span>
        </div>

        <div className="csc-card csc-card--total">
          <span className="csc-card-label">Grand Total</span>
          <span className="csc-card-value">${grandTotal.toLocaleString()}</span>
          <span className="csc-card-count">
            {summaryData.reduce((s, e) => s + (e.count || 0), 0)} total entries
          </span>
        </div>
      </div>

      {otherCategories.length > 0 && (
        <div className="csc-breakdown">
          <h4 className="csc-breakdown-title">Expense Breakdown</h4>
          <div className="csc-breakdown-list">
            {summaryData.map((entry) => (
              <div key={entry.category} className="csc-breakdown-item">
                <span className="csc-breakdown-cat">{entry.category}</span>
                <span className="csc-breakdown-amt">
                  ${Number(entry.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
