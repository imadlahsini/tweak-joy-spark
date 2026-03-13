import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
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
            Refund Policy
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
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              We stand behind our services with a 30-day money-back guarantee. If you're not satisfied with our SEO services within the first 30 days, you can request a full refund—no questions asked.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Eligibility for Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To be eligible for a refund, you must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Request the refund within 30 days of your initial purchase</li>
              <li>Provide access to your website and analytics as required for service delivery</li>
              <li>Not have violated our Terms of Service</li>
              <li>Not have requested a refund for the same service previously</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To request a refund, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li>Email us at Contact@JuniorAI.agency with the subject line "Refund Request"</li>
              <li>Include your name, email address used for purchase, and order/transaction ID</li>
              <li>Briefly explain the reason for your refund request (optional but helpful)</li>
              <li>We will process your request within 5 business days</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Refund Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Once your refund is approved, we will process the refund to your original payment method within 5-10 business days. The exact timing depends on your bank or credit card provider. You will receive an email confirmation once the refund has been processed.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Partial Refunds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For cancellations after the 30-day period, we may offer partial refunds based on:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>The amount of work completed on your project</li>
              <li>The remaining duration of your service plan</li>
              <li>Any deliverables already provided</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Partial refund amounts are calculated on a case-by-case basis and will be communicated before processing.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Non-Refundable Items</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The following are not eligible for refunds:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Services already rendered and delivered (reports, audits, etc.)</li>
              <li>Third-party tools or subscriptions purchased on your behalf</li>
              <li>Custom development work that has been completed</li>
              <li>Requests made after 30 days from the purchase date</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Service Cancellation</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your service at any time. For monthly subscriptions, cancellation will take effect at the end of your current billing period. For longer-term plans, please contact us to discuss options. We do not offer prorated refunds for unused portions of monthly plans.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have a dispute about your refund or believe an error has been made, please contact us at Contact@JuniorAI.agency. We are committed to resolving issues fairly and will work with you to find a satisfactory solution.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about our Refund Policy, please reach out:
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

export default RefundPolicy;
