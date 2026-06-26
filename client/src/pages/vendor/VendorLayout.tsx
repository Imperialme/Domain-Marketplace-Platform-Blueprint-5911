import { Route, Switch } from "wouter";
import { LayoutDashboard, Send, ClipboardList } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import VendorDashboard from "./VendorDashboard";
import VendorSubmitPrice from "./VendorSubmitPrice";
import VendorSubmissions from "./VendorSubmissions";

const navItems = [
  { path: "/vendor", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { path: "/vendor/submit", label: "Submit Price", icon: <Send size={16} /> },
  { path: "/vendor/submissions", label: "My Submissions", icon: <ClipboardList size={16} /> },
];

export default function VendorLayout() {
  return (
    <PortalLayout
      navItems={navItems}
      portalTitle="Vendor Portal"
      portalSubtitle="Sourcing Network"
      basePath="/vendor"
    >
      <Switch>
        <Route path="/vendor" component={VendorDashboard} />
        <Route path="/vendor/submit" component={VendorSubmitPrice} />
        <Route path="/vendor/submissions" component={VendorSubmissions} />
      </Switch>
    </PortalLayout>
  );
}
