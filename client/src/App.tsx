import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HowItWorks from "./pages/public/HowItWorks";
import Industries from "./pages/public/Industries";
import WhyUs from "./pages/public/WhyUs";
import ApplyAccess from "./pages/public/ApplyAccess";
import ApplyBuyer from "./pages/public/ApplyBuyer";
import ApplySupplier from "./pages/public/ApplySupplier";
import AdminLayout from "./pages/admin/AdminLayout";
import BuyerLayout from "./pages/buyer/BuyerLayout";
import VendorLayout from "./pages/vendor/VendorLayout";
import VendorAcceptInvite from "./pages/vendor/VendorAcceptInvite";
import BuyerFeedback from "./pages/buyer/BuyerFeedback";
import Brands from "./pages/public/Brands";
import BrandPage from "./pages/public/BrandPage";
import BrandCategoryPage from "./pages/public/BrandCategoryPage";
import BrandPartTypePage from "./pages/public/BrandPartTypePage";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";

function Router() {
  return (
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
