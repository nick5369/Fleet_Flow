import "./MonthlySummaryTable.css";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getMonthLabel(monthStr) {
  const parts = monthStr.split("-");
  const idx = parseInt(parts[1], 10) - 1;
  return MONTH_NAMES[idx] || monthStr;
}

export default function MonthlySummaryTable({ data, loading, year }) {
  if (loading) {
    return (
      <div className="mst-empty">
        <span className="spinner" />
      </div>
    );
  }

  const months = data?.months || [];

  if (!months.length) {
    return <div className="mst-empty">No monthly data for {year}.</div>;
  }

  function getCatAmount(categories, cat) {
    const entry = categories.find((c) => c.category === cat);
    return entry ? Number(entry.amount) : 0;
  }

  return (
    <div className="mst-wrapper">
      <h3 className="mst-heading">Monthly Expense Summary -- {year}</h3>
      <div className="mst-scroll">
        <table className="mst-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Fuel Cost</th>
              <th>Maintenance</th>
              <th>Toll</th>
              <th>Insurance</th>
              <th>Other</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => {
              const fuel = getCatAmount(m.categories, "FUEL");
              const maint = getCatAmount(m.categories, "MAINTENANCE");
              const toll = getCatAmount(m.categories, "TOLL");
              const insurance = getCatAmount(m.categories, "INSURANCE");
              const other = m.total - fuel - maint - toll - insurance;

              return (
                <tr key={m.month}>
                  <td className="mst-month">{getMonthLabel(m.month)}</td>
                  <td className="mst-num">${fuel.toLocaleString()}</td>
                  <td className="mst-num">${maint.toLocaleString()}</td>
                  <td className="mst-num">${toll.toLocaleString()}</td>
                  <td className="mst-num">${insurance.toLocaleString()}</td>
                  <td className="mst-num">
                    ${Math.max(0, other).toLocaleString()}
                  </td>
                  <td className="mst-num mst-bold">
                    ${m.total.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="mst-bold">Total</td>
              <td className="mst-num mst-bold">
                $
                {months
                  .reduce((s, m) => s + getCatAmount(m.categories, "FUEL"), 0)
                  .toLocaleString()}
              </td>
              <td className="mst-num mst-bold">
                $
                {months
                  .reduce(
                    (s, m) => s + getCatAmount(m.categories, "MAINTENANCE"),
                    0,
                  )
                  .toLocaleString()}
              </td>
              <td className="mst-num mst-bold">
                $
                {months
                  .reduce((s, m) => s + getCatAmount(m.categories, "TOLL"), 0)
                  .toLocaleString()}
              </td>
              <td className="mst-num mst-bold">
                $
                {months
                  .reduce(
                    (s, m) => s + getCatAmount(m.categories, "INSURANCE"),
                    0,
                  )
                  .toLocaleString()}
              </td>
              <td className="mst-num mst-bold">
                $
                {months
                  .reduce((s, m) => {
                    const fuel = getCatAmount(m.categories, "FUEL");
                    const maint = getCatAmount(m.categories, "MAINTENANCE");
                    const toll = getCatAmount(m.categories, "TOLL");
                    const ins = getCatAmount(m.categories, "INSURANCE");
                    return s + Math.max(0, m.total - fuel - maint - toll - ins);
                  }, 0)
                  .toLocaleString()}
              </td>
              <td className="mst-num mst-bold mst-grand">
                ${months.reduce((s, m) => s + m.total, 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
