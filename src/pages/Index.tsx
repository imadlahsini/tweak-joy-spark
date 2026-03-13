import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoBar from "@/components/landing/LogoBar";
import Services from "@/components/landing/Services";
import StatsStrip from "@/components/landing/StatsStrip";
import WhyAI from "@/components/landing/WhyAI";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonial from "@/components/landing/Testimonial";
import Pricing from "@/components/landing/Pricing";
import Trust from "@/components/landing/Trust";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <LogoBar />
      <Services />
      <StatsStrip />
      <WhyAI />
      <HowItWorks />
      <Testimonial />
      <Pricing />
      <Trust />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
