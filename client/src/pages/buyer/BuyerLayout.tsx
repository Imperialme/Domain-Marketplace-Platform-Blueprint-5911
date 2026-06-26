import { Route, Switch } from "wouter";
import { LayoutDashboard, FileText, BookOpen, DollarSign, FileCheck, MessageSquare } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import BuyerDashboard from "./BuyerDashboard";
import BuyerSubmitRFQ from "./BuyerSubmitRFQ";
import BuyerReferences from "./BuyerReferences";
import BuyerFees from "./BuyerFees";
import BuyerQuotations from "./BuyerQuotations";
import BuyerFeedback from "./BuyerFeedback";

const navItems = [
  { path: "/buyer", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { path: "/buyer/rfq/new", label: "Submit RFQ", icon: <FileText size={16} /> },
  { path: "/buyer/references", label: "My References", icon: <BookOpen size={16} /> },
  { path: "/buyer/fees", label: "Fees & Payments", icon: <DollarSign size={16} /> },
  { path: "/buyer/quotations", label: "Quotations", icon: <FileCheck size={16} /> },
  { path: "/buyer/feedback", label: "Feedback", icon: <MessageSquare size={16} /> },
];

export default function BuyerLayout() {
  return (
    <PortalLayout
      navItems={navItems}
      portalTitle="Buyer Portal"
      portalSubtitle="Procurement Desk"
      basePath="/buyer"
    >
      <Switch>
        <Route path="/buyer" component={BuyerDashboard} />
        <Route path="/buyer/rfq/new" component={BuyerSubmitRFQ} />
        <Route path="/buyer/references" component={BuyerReferences} />
        <Route path="/buyer/fees" component={BuyerFees} />
        <Route path="/buyer/quotations" component={BuyerQuotations} />
        <Route path="/buyer/feedback" component={BuyerFeedback} />
      </Switch>
    </PortalLayout>
  );
}
