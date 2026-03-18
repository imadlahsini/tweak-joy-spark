import { motion } from "framer-motion";
import { ArrowUp, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const footerLinks = {
  services: [
    { name: "AI SEO Audit", href: "#services" },
    { name: "On-Page Optimization", href: "#services" },
    { name: "Content Strategy", href: "#services" },
    { name: "Link Building", href: "#services" },
  ],
  company: [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: "𝕏", href: "#" },
  { name: "LinkedIn", icon: "in", href: "#" },
  { name: "Instagram", icon: "📷", href: "#" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-14 sm:py-18 md:py-24 bg-foreground text-background relative overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 dot-grid opacity-5" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <h3 className="font-display font-bold text-2xl mb-4">
              Junior Ifah
            </h3>
            <p className="text-background/60 text-sm leading-relaxed mb-6">
              AI-powered SEO solutions for US businesses. We combine cutting-edge technology with human expertise to deliver results.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <a href="mailto:Contact@JuniorAI.agency" className="flex items-center gap-3 text-sm text-background/70 hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-sm">
                <Mail className="w-4 h-4" />
                Contact@JuniorAI.agency
              </a>
              <a href="tel:+13239673954" className="flex items-center gap-3 text-sm text-background/70 hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-sm">
                <Phone className="w-4 h-4" />
                (323) 967-3954
              </a>
              <div className="flex items-center gap-3 text-sm text-background/60">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                11112 Boundless Valley Drive, Austin TX 78754
              </div>
            </div>
          </motion.div>

          {/* Services links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-background/60 hover:text-background transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-background/60 hover:text-background transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Legal links */}
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mt-8 mb-4 text-background/80">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-background/80">
              Stay Updated
            </h4>
            <p className="text-sm text-background/60 mb-4">
              Get the latest SEO tips and insights delivered to your inbox.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/40 text-sm h-10 focus:border-primary"
              />
              <Button 
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 h-10"
              >
                Subscribe
              </Button>
            </form>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 py-8 border-t border-b border-background/10"
        >
          <div className="flex items-center gap-2 text-sm text-background/60">
            <span className="text-yellow-400">★★★★★</span>
            <span>100+ 5-Star Reviews</span>
          </div>
          <span className="hidden sm:block text-background/20">|</span>
          <div className="text-sm text-background/60">
            🏆 Top SEO Agency 2024
          </div>
          <span className="hidden sm:block text-background/20">|</span>
          <div className="text-sm text-background/60">
            🔒 100% Secure
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
        >
          <p className="text-background/50 text-sm">
            © {currentYear} Junior Ifah Agency. All rights reserved.
          </p>
          
          {/* Back to top button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors group"
          >
            Back to top
            <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <ArrowUp className="w-4 h-4" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;