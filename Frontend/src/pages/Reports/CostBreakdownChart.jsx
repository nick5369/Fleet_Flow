import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./ReportCharts.css";

const SHADES = [
  "#000000",
  "#333333",
  "#555555",
  "#777777",
  "#999999",
  "#bbbbbb",
  "#dddddd",
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

export default function CostBreakdownChart({ monthlyData }) {
  const months = monthlyData?.months || [];
  if (!months.length) {
    return <div className="rc-empty">No expense data to display.</div>;
  }

  const catMap = {};
  for (const m of months) {
    for (const c of m.categories) {
      if (!catMap[c.category]) catMap[c.category] = 0;
      catMap[c.category] += Number(c.amount);
    }
  }

  const chartData = Object.entries(catMap)
    .map(([name, value]) => ({
      name: CAT_LABELS[name] || name,
      value: Number(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);

  if (!chartData.length) {
    return <div className="rc-empty">No expense data to display.</div>;
  }

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rc-wrapper">
      <h3 className="rc-heading">Cost Breakdown by Category</h3>
      <div className="rc-pie-layout">
        <div className="rc-pie-chart">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                dataKey="value"
                stroke="var(--surface)"
                strokeWidth={2}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={SHADES[i % SHADES.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rc-pie-legend">
          {chartData.map((d, i) => (
            <div key={d.name} className="rc-pie-legend-row">
              <span className="rc-pie-legend-left">
                <span
                  className="rc-dot"
                  style={{ background: SHADES[i % SHADES.length] }}
                />
                {d.name}
              </span>
              <span className="rc-pie-legend-right">
                <span className="rc-pie-legend-val">
                  ${d.value.toLocaleString()}
                </span>
                <span className="rc-pie-legend-pct">
                  {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
