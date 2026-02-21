import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ReportCharts.css";

const MONTH_SHORT = [
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

function getLabel(monthStr) {
  const idx = parseInt(monthStr.split("-")[1], 10) - 1;
  return MONTH_SHORT[idx] || monthStr;
}

function getCat(categories, cat) {
  const e = categories.find((c) => c.category === cat);
  return e ? Number(e.amount) : 0;
}

export default function MonthlyCostChart({ data, year }) {
  const months = data?.months || [];
  if (!months.length) {
    return <div className="rc-empty">No monthly data for {year}.</div>;
  }

  const chartData = months.map((m) => ({
    month: getLabel(m.month),
    Fuel: getCat(m.categories, "FUEL"),
    Maintenance: getCat(m.categories, "MAINTENANCE"),
    Other: Math.max(
      0,
      m.total -
        getCat(m.categories, "FUEL") -
        getCat(m.categories, "MAINTENANCE"),
    ),
  }));

  return (
    <div className="rc-wrapper">
      <h3 className="rc-heading">Monthly Cost Trend -- {year}</h3>
      <div className="rc-chart-area">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`]}
            />
            <Bar
              dataKey="Fuel"
              stackId="cost"
              fill="#000000"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Maintenance"
              stackId="cost"
              fill="#666666"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Other"
              stackId="cost"
              fill="#bbbbbb"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rc-legend">
        <span className="rc-legend-item">
          <span className="rc-dot" style={{ background: "#000000" }} />
          Fuel
        </span>
        <span className="rc-legend-item">
          <span className="rc-dot" style={{ background: "#666666" }} />
          Maintenance
        </span>
        <span className="rc-legend-item">
          <span className="rc-dot" style={{ background: "#bbbbbb" }} />
          Other
        </span>
      </div>
    </div>
  );
}
