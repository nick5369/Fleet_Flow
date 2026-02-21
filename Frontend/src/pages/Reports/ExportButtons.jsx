import { Download } from "lucide-react";
import "./ExportButtons.css";

function formatDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toCSVContent(vehicleData, monthlyData) {
  const lines = [];

  lines.push("VEHICLE PERFORMANCE");
  lines.push(
    "Vehicle,Distance (km),Fuel Used (L),Fuel Efficiency (km/L),Op. Expenses,Total Cost,Cost/km,Trips",
  );
  for (const r of vehicleData) {
    lines.push(
      [
        r.licensePlate || r.vehicleId,
        r.totalDistanceKm || 0,
        r.totalLiters || 0,
        r.kmPerLiter != null ? r.kmPerLiter.toFixed(2) : "",
        r.operationalExpenses || 0,
        r.totalCost || 0,
        r.costPerKm != null ? r.costPerKm.toFixed(2) : "",
        r.completedTrips ?? "",
      ].join(","),
    );
  }

  lines.push("");
  lines.push("MONTHLY EXPENSE SUMMARY");
  lines.push("Month,Fuel,Maintenance,Toll,Insurance,Other,Total");
  const months = monthlyData?.months || [];
  for (const m of months) {
    const getCat = (cat) => {
      const e = m.categories.find((c) => c.category === cat);
      return e ? e.amount : 0;
    };
    const fuel = getCat("FUEL");
    const maint = getCat("MAINTENANCE");
    const toll = getCat("TOLL");
    const ins = getCat("INSURANCE");
    const other = Math.max(0, m.total - fuel - maint - toll - ins);
    lines.push(
      [m.month, fuel, maint, toll, ins, other.toFixed(2), m.total].join(","),
    );
  }

  return lines.join("\n");
}

export default function ExportButtons({ vehicleData, monthlyData }) {
  function handleCSV() {
    const content = toCSVContent(vehicleData || [], monthlyData);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-report-${formatDate()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePDF() {
    window.print();
  }

  return (
    <div className="eb-container">
      <button className="eb-btn" onClick={handleCSV}>
        <Download size={16} />
        Export CSV
      </button>
      <button className="eb-btn eb-btn--outline" onClick={handlePDF}>
        <Download size={16} />
        Export PDF
      </button>
    </div>
  );
}
