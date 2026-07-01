import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Public marketing pages — split so the landing page loads with the minimum JS
const HowItWorks = lazy(() => import("./pages/public/HowItWorks"));
const Industries = lazy(() => import("./pages/public/Industries"));
const WhyUs = lazy(() => import("./pages/public/WhyUs"));
const ApplyAccess = lazy(() => import("./pages/public/ApplyAccess"));
const ApplyBuyer = lazy(() => import("./pages/public/ApplyBuyer"));
const ApplySupplier = lazy(() => import("./pages/public/ApplySupplier"));
const Blog = lazy(() => import("./pages/public/Blog"));
const BlogPost = lazy(() => import("./pages/public/BlogPost"));
const Brands = lazy(() => import("./pages/public/Brands"));
const BrandPage = lazy(() => import("./pages/public/BrandPage"));
const BrandCategoryPage = lazy(() => import("./pages/public/BrandCategoryPage"));
const BrandPartTypePage = lazy(() => import("./pages/public/BrandPartTypePage"));

// Portals — public visitors never pay for the admin console, dashboards, or charts
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const BuyerLayout = lazy(() => import("./pages/buyer/BuyerLayout"));
const VendorLayout = lazy(() => import("./pages/vendor/VendorLayout"));
const VendorAcceptInvite = lazy(() => import("./pages/vendor/VendorAcceptInvite"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-900, #0a121e)" }}>
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/industries" component={Industries} />
        <Route path="/why-us" component={WhyUs} />
        <Route path="/apply" component={ApplyAccess} />
        <Route path="/apply/buyer" component={ApplyBuyer} />
        <Route path="/apply/supplier" component={ApplySupplier} />
        {/* Blog routes */}
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        {/* Brand SEO routes */}
        <Route path="/brands" component={Brands} />
        <Route path="/brands/category/:slug" component={BrandCategoryPage} />
        <Route path="/brands/:slug/:partType" component={BrandPartTypePage} />
        <Route path="/brands/:slug" component={BrandPage} />
        {/* Admin routes — AdminLayout handles all /admin/* internally */}
        <Route path="/admin" component={AdminLayout} />
        <Route path="/admin/:rest*" component={AdminLayout} />
        {/* Buyer routes — BuyerLayout handles all /buyer/* internally */}
        <Route path="/buyer" component={BuyerLayout} />
        <Route path="/buyer/:rest*" component={BuyerLayout} />
        {/* Vendor accept invite — public, no auth required */}
        <Route path="/vendor/accept-invite" component={VendorAcceptInvite} />
        {/* Vendor routes — VendorLayout handles all /vendor/* internally */}
        <Route path="/vendor" component={VendorLayout} />
        <Route path="/vendor/:rest*" component={VendorLayout} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
