import { ChevronLeft, ChevronRight } from "lucide-react";
import "./VehiclePerformanceTable.css";

export default function VehiclePerformanceTable({
  data,
  loading,
  getVehicleLabel,
}) {
  if (loading) {
    return (
      <div className="vpt-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div className="vpt-empty">No vehicle performance data available.</div>
    );
  }

  return (
    <div className="vpt-wrapper">
      <h3 className="vpt-heading">Vehicle Performance</h3>
      <div className="vpt-scroll">
        <table className="vpt-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Distance (km)</th>
              <th>Fuel Used (L)</th>
              <th>Fuel Efficiency (km/L)</th>
              <th>Op. Expenses</th>
              <th>Total Cost</th>
              <th>Cost / km</th>
              <th>Trips</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.vehicleId}>
                <td className="vpt-vehicle">
                  {row.licensePlate || getVehicleLabel(row.vehicleId)}
                </td>
                <td className="vpt-num">
                  {Number(row.totalDistanceKm || 0).toLocaleString()}
                </td>
                <td className="vpt-num">
                  {Number(row.totalLiters || 0).toLocaleString()}
                </td>
                <td className="vpt-num vpt-bold">
                  {row.kmPerLiter != null ? row.kmPerLiter.toFixed(2) : "-"}
                </td>
                <td className="vpt-num">
                  ${Number(row.operationalExpenses || 0).toLocaleString()}
                </td>
                <td className="vpt-num">
                  ${Number(row.totalCost || 0).toLocaleString()}
                </td>
                <td className="vpt-num vpt-bold">
                  {row.costPerKm != null ? `$${row.costPerKm.toFixed(2)}` : "-"}
                </td>
                <td className="vpt-num">{row.completedTrips ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
