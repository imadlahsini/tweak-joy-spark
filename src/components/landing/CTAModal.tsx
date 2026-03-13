import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCTAModal } from "@/contexts/CTAModalContext";

// Telegram Bot Configuration - Replace with your actual values
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

const CTAModal = () => {
  const { isOpen, closeModal } = useCTAModal();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !website.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both your email and website URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const message = `🆕 New SEO Audit Request\n\n📧 Email: ${email}\n🌐 Website: ${website}\n📅 Date: ${new Date().toLocaleString()}`;

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || "Telegram API error");
      }

      setIsSubmitted(true);
      setEmail("");
      setWebsite("");

      toast({
        title: "Request submitted!",
        description: "We'll reach out to you within 24 hours.",
      });

      // Close modal after success
      setTimeout(() => {
        closeModal();
        setIsSubmitted(false);
      }, 2000);
    } catch (error: any) {
      console.error("Telegram error:", error);
      toast({
        title: "Something went wrong",
        description: error?.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      // Reset form state when closing
      setTimeout(() => {
        setEmail("");
        setWebsite("");
        setIsSubmitted(false);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-t-lg" />
        
        <DialogHeader className="text-center pt-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg"
          >
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <DialogTitle className="font-display text-2xl font-bold">
            Get Your Free SEO Audit
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your details and we'll analyze your site within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Request Submitted!
              </h3>
              <p className="text-muted-foreground text-sm">
                We'll reach out to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="modal-email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-website" className="text-foreground font-medium">
                  Website URL
                </Label>
                <Input
                  id="modal-website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium text-base group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Get My Free Audit
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Free audit • No commitment • Results in 24 hours
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CTAModal;
