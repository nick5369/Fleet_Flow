import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import {
  ProtectedRoute,
  GuestRoute,
} from "./components/RouteGuards/RouteGuards";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Placeholder from "./pages/Placeholder/Placeholder";
import VehiclesPage from "./pages/Vehicles/VehiclesPage";
import TripsPage from "./pages/Trips/TripsPage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="drivers" element={<Placeholder title="Drivers" />} />
              <Route path="trips" element={<TripsPage />} />
              <Route
                path="maintenance"
                element={<Placeholder title="Maintenance" />}
              />
              <Route path="fuel" element={<Placeholder title="Fuel Logs" />} />
              <Route
                path="expenses"
                element={<Placeholder title="Expenses" />}
              />
              <Route
                path="dispatch"
                element={<Placeholder title="Dispatch" />}
              />
              <Route path="safety" element={<Placeholder title="Safety" />} />
              <Route path="reports" element={<Placeholder title="Reports" />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
