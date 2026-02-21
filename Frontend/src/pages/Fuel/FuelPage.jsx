import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { fuelLogAPI, vehicleAPI } from "../../services/api";
import { Plus, Eye, Edit } from "lucide-react";
import FuelTable from "./FuelTable";
import FuelModal from "./FuelModal";
import FuelDetailModal from "./FuelDetailModal";
import "./FuelPage.css";

const WRITE_ROLES = ["MANAGER", "DISPATCHER"];

export default function FuelPage() {
  const { user } = useAuth();
  const canWrite = WRITE_ROLES.includes(user?.role);

  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");

  const [fuelLogs, setFuelLogs] = useState([]);
  const [fuelLoading, setFuelLoading] = useState(true);
  const [fuelPage, setFuelPage] = useState(1);
  const [fuelTotalPages, setFuelTotalPages] = useState(1);
  const [fuelTotal, setFuelTotal] = useState(0);
  const [fuelSearch, setFuelSearch] = useState("");
  const [fuelCreateOpen, setFuelCreateOpen] = useState(false);
  const [fuelEditLog, setFuelEditLog] = useState(null);
  const [fuelDetailLog, setFuelDetailLog] = useState(null);
  const [fuelDetailLoading, setFuelDetailLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleAPI.list({ limit: 100 });
      setVehicles(res.data || []);
    } catch {
      /* silent */
    }
  }, []);

  const fetchFuelLogs = useCallback(async () => {
    setFuelLoading(true);
    setError("");
    try {
      const params = { page: fuelPage, limit: 10 };
      const res = await fuelLogAPI.list(params);
      setFuelLogs(res.fuelLogs || []);
      setFuelTotalPages(res.pagination?.totalPages || 1);
      setFuelTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load fuel logs");
      setFuelLogs([]);
    } finally {
      setFuelLoading(false);
    }
  }, [fuelPage]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    fetchFuelLogs();
  }, [fetchFuelLogs]);

  const filteredFuel = fuelSearch
    ? fuelLogs.filter((l) => {
        const term = fuelSearch.toLowerCase();
        return (
          l.stationName?.toLowerCase().includes(term) ||
          l.fuelType?.toLowerCase().includes(term) ||
          l.id?.toLowerCase().includes(term)
        );
      })
    : fuelLogs;

  function getVehicleLabel(id) {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.licensePlate} (${v.make} ${v.model})` : id?.slice(0, 8);
  }

  async function viewFuelDetail(log) {
    setFuelDetailLoading(true);
    try {
      const res = await fuelLogAPI.getById(log.id);
      setFuelDetailLog(res.fuelLog);
    } catch {
      setFuelDetailLog(log);
    } finally {
      setFuelDetailLoading(false);
    }
  }

  async function handleFuelCreate(payload) {
    await fuelLogAPI.create(payload);
    setFuelCreateOpen(false);
    fetchFuelLogs();
    fetchVehicles();
  }

  async function handleFuelUpdate(payload) {
    await fuelLogAPI.update(fuelEditLog.id, payload);
    setFuelEditLog(null);
    fetchFuelLogs();
  }

  const FUEL_TYPE_LABELS = {
    DIESEL: "Diesel",
    PETROL: "Petrol",
    CNG: "CNG",
    LPG: "LPG",
    ELECTRIC: "Electric",
  };

  return (
    <div className="fp-container">
      <div className="fp-header">
        <div>
          <h1 className="fp-title">Fuel Logs</h1>
          <p className="fp-subtitle">
            Track fuel consumption and fill records per vehicle
          </p>
        </div>
        {canWrite && (
          <button
            className="fp-add-btn"
            onClick={() => setFuelCreateOpen(true)}
          >
            <Plus size={18} />
            Add Fuel Log
          </button>
        )}
      </div>

      {error && <div className="fp-error">{error}</div>}

      <div className="fp-toolbar">
        <div className="fp-toolbar-search">
          <input
            type="text"
            placeholder="Search station, fuel type..."
            value={fuelSearch}
            onChange={(e) => setFuelSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="fp-desktop-table">
        <FuelTable
          logs={filteredFuel}
          loading={fuelLoading}
          pagination={{
            page: fuelPage,
            totalPages: fuelTotalPages,
            total: fuelTotal,
          }}
          onPageChange={setFuelPage}
          onView={viewFuelDetail}
          onEdit={canWrite ? (l) => setFuelEditLog(l) : null}
          getVehicleLabel={getVehicleLabel}
          canWrite={canWrite}
        />
      </div>

      <div className="fp-cards">
        {fuelLoading && (
          <div className="flt-empty">
            <span className="spinner" />
          </div>
        )}
        {!fuelLoading && !filteredFuel.length && (
          <div className="flt-empty">No fuel logs found.</div>
        )}
        {!fuelLoading &&
          filteredFuel.map((l) => (
            <div key={l.id} className="fp-card">
              <div className="fp-card-header">
                <span className="fp-card-id">{l.id.slice(0, 8)}</span>
                <span className="fp-card-type">
                  {FUEL_TYPE_LABELS[l.fuelType] || l.fuelType}
                </span>
              </div>
              <div className="fp-card-body">
                <div>
                  <div className="fp-card-label">Vehicle</div>
                  <div className="fp-card-value">
                    {getVehicleLabel(l.vehicleId)}
                  </div>
                </div>
                <div>
                  <div className="fp-card-label">Liters</div>
                  <div className="fp-card-value">
                    {Number(l.liters).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="fp-card-label">Total Cost</div>
                  <div className="fp-card-value fp-card-value--bold">
                    ${Number(l.totalCost).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="fp-card-label">Date</div>
                  <div className="fp-card-value">
                    {l.filledAt
                      ? new Date(l.filledAt).toLocaleDateString()
                      : new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="fp-card-actions">
                <button onClick={() => viewFuelDetail(l)}>
                  <Eye size={14} /> View
                </button>
                {canWrite && (
                  <button onClick={() => setFuelEditLog(l)}>
                    <Edit size={14} /> Edit
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {fuelCreateOpen && (
        <FuelModal
          vehicles={vehicles}
          onClose={() => setFuelCreateOpen(false)}
          onSubmit={handleFuelCreate}
        />
      )}

      {fuelEditLog && (
        <FuelModal
          vehicles={vehicles}
          log={fuelEditLog}
          onClose={() => setFuelEditLog(null)}
          onSubmit={handleFuelUpdate}
        />
      )}

      {(fuelDetailLog || fuelDetailLoading) && (
        <FuelDetailModal
          log={fuelDetailLog}
          loading={fuelDetailLoading}
          onClose={() => setFuelDetailLog(null)}
          getVehicleLabel={getVehicleLabel}
        />
      )}
    </div>
  );
}
