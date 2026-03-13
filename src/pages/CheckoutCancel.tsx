import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import FloatingOrb from "@/components/shared/FloatingOrb";

const CheckoutCancel = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("plan") || "";
  const tryAgainPath = returnTo ? `/checkout/${returnTo}` : "/checkout";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/15 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/10 via-transparent to-transparent blur-3xl"
        />
      </div>

      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <FloatingOrb className="bg-primary/12 -top-32 -right-32 hidden md:block" size="w-[500px] h-[500px]" delay={0} />
      <FloatingOrb className="bg-accent/8 bottom-0 -left-40 hidden md:block" size="w-[450px] h-[450px]" delay={0.4} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md w-full bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 sm:p-10 shadow-elevated"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-destructive" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          No worries — your payment was not processed. Feel free to try again whenever you're ready.
        </p>
        <Button asChild>
          <Link to={tryAgainPath}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Try Again
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default CheckoutCancel;
