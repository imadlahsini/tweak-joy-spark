import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Appointment from "./pages/Appointment";
import NotFound from "./pages/NotFound";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Checkout from "./pages/Checkout";
import PlanCheckout from "./pages/PlanCheckout";
import BundleCheckout from "./pages/BundleCheckout";
import YearSpecialCheckout from "./pages/YearSpecialCheckout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminLinks from "./pages/admin/AdminLinks";
import AdminLayout from "./components/admin/AdminLayout";
import { CTAModalProvider } from "@/contexts/CTAModalContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CTAModal from "@/components/landing/CTAModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CTAModalProvider>
          <Toaster />
          <Sonner />
          <CTAModal />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/home" element={<Index />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/checkout/1-year-special" element={<YearSpecialCheckout />} />
              <Route path="/checkout/:planSlug" element={<PlanCheckout />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin">
                <Route index element={<AdminLogin />} />
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="links" element={<AdminLinks />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CTAModalProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
