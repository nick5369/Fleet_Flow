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

export default function FuelEfficiencyChart({ fuelData, getVehicleLabel }) {
  if (!fuelData || !fuelData.length) {
    return <div className="rc-empty">No fuel efficiency data available.</div>;
  }

  const chartData = fuelData
    .filter((v) => v.kmPerLiter != null && v.kmPerLiter > 0)
    .map((v) => {
      const label = getVehicleLabel(v.vehicleId);
      const short = label.length > 12 ? label.slice(0, 12) + "..." : label;
      return {
        vehicle: short,
        fullName: label,
        efficiency: Number(v.kmPerLiter.toFixed(2)),
      };
    })
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 10);

  if (!chartData.length) {
    return <div className="rc-empty">No fuel efficiency data available.</div>;
  }

  return (
    <div className="rc-wrapper">
      <h3 className="rc-heading">Fuel Efficiency by Vehicle (km/L)</h3>
      <div className="rc-chart-area">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            layout="vertical"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              tickFormatter={(v) => `${v} km/L`}
            />
            <YAxis
              type="category"
              dataKey="vehicle"
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name, props) => [
                `${value} km/L`,
                props.payload.fullName,
              ]}
            />
            <Bar
              dataKey="efficiency"
              fill="#000000"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
