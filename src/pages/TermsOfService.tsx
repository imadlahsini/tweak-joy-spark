import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" className="text-background/70 hover:text-background hover:bg-background/10 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl font-bold"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-background/70 mt-4"
          >
            Last updated: January 17, 2025
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Junior AI Agency's services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">2. Description of Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Junior AI Agency provides AI-powered SEO services including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>SEO audits and analysis</li>
              <li>On-page optimization recommendations</li>
              <li>Keyword research and tracking</li>
              <li>Content strategy development</li>
              <li>Link building services</li>
              <li>Performance reporting and analytics</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a user of our services, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information about your business and website</li>
              <li>Grant necessary access to your website and analytics platforms</li>
              <li>Respond to communications in a timely manner</li>
              <li>Not use our services for any unlawful purposes</li>
              <li>Not attempt to reverse engineer or copy our proprietary methods</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">4. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              All fees are due as specified in your selected plan. Payment is required upfront for the duration of the service period. We accept major credit cards and other payment methods as displayed during checkout. All prices are in USD unless otherwise stated.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, strategies, reports, and materials provided by Junior AI Agency remain our intellectual property unless explicitly transferred. You retain ownership of your website content and data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">6. Results Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to improve your search engine rankings, we cannot guarantee specific results. SEO outcomes depend on many factors including competition, industry, and search engine algorithm changes. Past performance does not guarantee future results.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Junior AI Agency shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid by you for the services in question.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate services at any time. Upon termination, we will provide any completed work and reports. Refunds are subject to our Refund Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">9. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              Email: Contact@JuniorAI.agency<br />
              Phone: (323) 967-3954<br />
              Address: 11112 Boundless Valley Drive, Austin TX 78754
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
