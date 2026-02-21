import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { analyticsAPI, vehicleAPI } from "../../services/api";
import KpiCard from "./KpiCard";
import ReportFilters from "./ReportFilters";
import VehiclePerformanceTable from "./VehiclePerformanceTable";
import MonthlySummaryTable from "./MonthlySummaryTable";
import ExportButtons from "./ExportButtons";
import MonthlyCostChart from "./MonthlyCostChart";
import CostBreakdownChart from "./CostBreakdownChart";
import FuelEfficiencyChart from "./FuelEfficiencyChart";
import "./ReportsPage.css";

const FULL_ACCESS = ["MANAGER", "FINANCE_ANALYST"];
const SUMMARY_ONLY = ["SAFETY_OFFICER"];

export default function ReportsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const hasFullAccess = FULL_ACCESS.includes(role);
  const hasSummary = SUMMARY_ONLY.includes(role);

  if (!hasFullAccess && !hasSummary) {
    return (
      <div className="rp-denied">
        <h2>Unauthorized</h2>
        <p>You do not have access to analytics and reports.</p>
      </div>
    );
  }

  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  const [fuelEffData, setFuelEffData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [costKmData, setCostKmData] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [fleetUtil, setFleetUtil] = useState(null);
  const [tripData, setTripData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleAPI.list({ limit: 200 });
      setVehicles(res.data || []);
    } catch {
      /* silent */
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (vehicleId) params.vehicleId = vehicleId;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const monthParams = { year };
      if (vehicleId) monthParams.vehicleId = vehicleId;

      const [fuelRes, roiRes, costRes, monthRes, utilRes, tripRes] =
        await Promise.all([
          analyticsAPI.fuelEfficiency(params),
          analyticsAPI.vehicleROI(vehicleId ? { vehicleId } : {}),
          analyticsAPI.costPerKm(params),
          analyticsAPI.monthlyExpenses(monthParams),
          analyticsAPI.fleetUtilization(),
          analyticsAPI.trips(params),
        ]);

      setFuelEffData(fuelRes.fuelEfficiency || []);
      setRoiData(roiRes.vehicleROI || []);
      setCostKmData(costRes.costPerKm || []);
      setMonthlyData(monthRes.monthlyExpenses || null);
      setFleetUtil(utilRes.fleetUtilization || null);
      setTripData(tripRes.tripAnalytics || null);
    } catch (err) {
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [vehicleId, dateFrom, dateTo, year]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const avgFuelEff =
    fuelEffData.length > 0
      ? (
          fuelEffData.reduce((s, v) => s + (v.kmPerLiter || 0), 0) /
            fuelEffData.filter((v) => v.kmPerLiter != null).length || 0
        ).toFixed(2)
      : "-";

  const totalOpCost = roiData.reduce(
    (s, v) => s + Number(v.operationalExpenses || 0),
    0,
  );

  const avgCostPerKm =
    costKmData.length > 0
      ? (
          costKmData.reduce((s, v) => s + (v.costPerKm || 0), 0) /
            costKmData.filter((v) => v.costPerKm != null).length || 0
        ).toFixed(2)
      : "-";

  const totalDistance = roiData.reduce(
    (s, v) => s + Number(v.totalDistanceKm || 0),
    0,
  );

  function getVehicleLabel(id) {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.licensePlate} (${v.make} ${v.model})` : id?.slice(0, 8);
  }

  const mergedPerformance = roiData.map((roi) => {
    const fuel = fuelEffData.find((f) => f.vehicleId === roi.vehicleId);
    const cost = costKmData.find((c) => c.vehicleId === roi.vehicleId);
    return {
      vehicleId: roi.vehicleId,
      licensePlate: roi.licensePlate,
      totalDistanceKm: roi.totalDistanceKm,
      totalLiters: fuel?.totalLiters || 0,
      kmPerLiter: fuel?.kmPerLiter ?? null,
      operationalExpenses: roi.operationalExpenses,
      totalCost: roi.totalCost,
      costPerKm: cost?.costPerKm ?? roi.costPerKm ?? null,
      completedTrips: roi.completedTrips,
    };
  });

  const monthlyTotal =
    monthlyData?.months?.reduce((s, m) => s + m.total, 0) || 0;

  return (
    <div className="rp-container">
      <div className="rp-header">
        <div>
          <h1 className="rp-title">Operational Analytics & Reports</h1>
          <p className="rp-subtitle">Performance insights and export tools</p>
        </div>
        {hasFullAccess && (
          <ExportButtons
            vehicleData={mergedPerformance}
            monthlyData={monthlyData}
          />
        )}
      </div>

      <ReportFilters
        vehicles={vehicles}
        vehicleId={vehicleId}
        onVehicleChange={setVehicleId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        year={year}
        onYearChange={setYear}
      />

      {error && <div className="rp-error">{error}</div>}

      {loading ? (
        <div className="rp-loading">
          <span className="spinner" />
        </div>
      ) : (
        <>
          <div className="rp-kpi-grid">
            <KpiCard
              label="Avg Fuel Efficiency"
              value={avgFuelEff !== "-" ? `${avgFuelEff} km/L` : "-"}
              sub={`${fuelEffData.length} vehicles tracked`}
            />
            <KpiCard
              label="Avg Cost per km"
              value={avgCostPerKm !== "-" ? `$${avgCostPerKm}` : "-"}
              sub={`${costKmData.length} vehicles`}
            />
            <KpiCard
              label="Total Operational Cost"
              value={`$${totalOpCost.toLocaleString()}`}
              sub={`${totalDistance.toLocaleString()} km total distance`}
            />
            <KpiCard
              label="Fleet Utilization"
              value={fleetUtil ? `${fleetUtil.utilizationRate}%` : "-"}
              sub={
                fleetUtil
                  ? `${fleetUtil.onTrip} on trip / ${fleetUtil.activeFleet} active`
                  : ""
              }
            />
            <KpiCard
              label="Completed Trips"
              value={tripData?.completed?.count ?? "-"}
              sub={
                tripData ? `${tripData.completionRate}% completion rate` : ""
              }
            />
            <KpiCard
              label={`${year} Total Expenses`}
              value={`$${monthlyTotal.toLocaleString()}`}
              sub={`${monthlyData?.months?.length || 0} months of data`}
            />
          </div>

          {hasFullAccess && (
            <>
              <div className="rp-charts-section">
                <div className="rp-charts-row">
                  <MonthlyCostChart data={monthlyData} year={year} />
                  <CostBreakdownChart monthlyData={monthlyData} />
                </div>
                <FuelEfficiencyChart
                  fuelData={fuelEffData}
                  getVehicleLabel={getVehicleLabel}
                />
              </div>

              <VehiclePerformanceTable
                data={mergedPerformance}
                loading={false}
                getVehicleLabel={getVehicleLabel}
              />

              <MonthlySummaryTable
                data={monthlyData}
                loading={false}
                year={year}
              />
            </>
          )}

          {hasSummary && (
            <div className="rp-summary-only">
              <MonthlySummaryTable
                data={monthlyData}
                loading={false}
                year={year}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
