import {
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  DollarSign,
  LayoutDashboard,
  ClipboardList,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    desc: "Overview and quick access",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCE_ANALYST"],
  },
  {
    key: "vehicles",
    label: "Vehicles",
    desc: "Fleet inventory, status and tracking",
    path: "/dashboard/vehicles",
    icon: Truck,
    roles: ["MANAGER", "DISPATCHER", "FINANCE_ANALYST"],
  },
  {
    key: "drivers",
    label: "Drivers",
    desc: "Driver profiles, licenses and scores",
    path: "/dashboard/drivers",
    icon: Users,
    roles: ["MANAGER", "DISPATCHER", "SAFETY_OFFICER"],
  },
  {
    key: "trips",
    label: "Trips",
    desc: "Schedule, dispatch and track trips",
    path: "/dashboard/trips",
    icon: Map,
    roles: ["MANAGER", "DISPATCHER"],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    desc: "Service logs and scheduled work",
    path: "/dashboard/maintenance",
    icon: Wrench,
    roles: ["MANAGER", "SAFETY_OFFICER"],
  },
  {
    key: "fuel",
    label: "Fuel Logs",
    desc: "Fuel consumption and fill records",
    path: "/dashboard/fuel",
    icon: Fuel,
    roles: ["MANAGER", "FINANCE_ANALYST"],
  },
  {
    key: "expenses",
    label: "Expenses",
    desc: "Cost tracking across categories",
    path: "/dashboard/expenses",
    icon: DollarSign,
    roles: ["MANAGER", "FINANCE_ANALYST"],
  },
  {
    key: "dispatch",
    label: "Dispatch",
    desc: "Assign drivers and manage routes",
    path: "/dashboard/dispatch",
    icon: ClipboardList,
    roles: ["DISPATCHER"],
  },
  {
    key: "safety",
    label: "Safety",
    desc: "Compliance, scores and alerts",
    path: "/dashboard/safety",
    icon: ShieldAlert,
    roles: ["SAFETY_OFFICER"],
  },
  {
    key: "reports",
    label: "Reports",
    desc: "Analytics and financial summaries",
    path: "/dashboard/reports",
    icon: BarChart3,
    roles: ["MANAGER", "FINANCE_ANALYST"],
  },
];

export function getNavForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export default NAV_ITEMS;
