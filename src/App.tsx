import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Appointment from "./pages/Appointment";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import AppointmentConfirmation from "./pages/AppointmentConfirmation";
import AdminLogin from "./pages/AdminLogin";
import AdminReservations from "./pages/AdminReservations";
import AdminQueue from "./pages/AdminQueue";
import AdminSettings from "./pages/AdminSettings";
import AdminProfiles from "./pages/AdminProfiles";
import AdminPatientProfile from "./pages/AdminPatientProfile";
import AdminEntryRedirect from "./pages/AdminEntryRedirect";
import QueueDisplay from "./pages/QueueDisplay";
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
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/appointment/confirmation" element={<AppointmentConfirmation />} />
              <Route path="/home" element={<Index />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/admin" element={<AdminEntryRedirect />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/profiles" element={<AdminProfiles />} />
              <Route path="/admin/profiles/:profileId" element={<AdminPatientProfile />} />
              <Route path="/admin/reservations" element={<AdminReservations />} />
              <Route path="/admin/queue" element={<AdminQueue />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/queue-display" element={<QueueDisplay />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CTAModalProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
