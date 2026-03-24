import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, Loader2, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import FloatingOrb from "@/components/shared/FloatingOrb";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        if (data.session) {
          navigate("/admin/queue", { replace: true });
          return;
        }
      } catch {
        if (!mounted) return;
        setLoginError("Unable to verify session. Please sign in.");
      } finally {
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    setLoginError(null);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      setLoginError(error.message);
      return;
    }

    navigate("/admin/queue", { replace: true });
  };

  // Session checking state
  if (isCheckingSession) {
    return (
      <div className="admin-theme admin-shell-bg relative flex min-h-screen items-center justify-center overflow-hidden text-foreground">
        <FloatingOrb className="bg-cyan-500/15 top-[15%] left-[10%]" size="w-72 h-72" />
        <FloatingOrb className="bg-teal-500/10 bottom-[10%] right-[15%]" size="w-80 h-80" delay={1} />

        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="admin-icon-plate h-14 w-14 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-cyan-700" />
          </div>
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-theme admin-shell-bg relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 text-foreground">
      {/* Atmospheric orbs */}
      <FloatingOrb className="bg-cyan-500/15 top-[15%] left-[10%]" size="w-72 h-72" />
      <FloatingOrb className="bg-teal-500/10 bottom-[10%] right-[15%]" size="w-80 h-80" delay={1} />

      {/* Dot grid texture */}
      <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.7 }}
        className="relative w-full max-w-md rounded-[28px] admin-glass-panel p-8 sm:p-10"
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rounded-t-[28px]" />

        {/* Brand area */}
        <div className="flex flex-col items-center text-center">
          <div className="admin-icon-plate h-14 w-14 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-cyan-700" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Clinic Operations Console</p>
        </div>

        {/* Separator */}
        <div className="section-divider my-6" />

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-2"
          >
            <label
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              htmlFor="admin-email"
            >
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setLoginError(null);
              }}
              className="admin-control h-12 rounded-xl text-base"
              placeholder="admin@clinic.com"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="space-y-2"
          >
            <label
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              htmlFor="admin-password"
            >
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setLoginError(null);
              }}
              className="admin-control h-12 rounded-xl text-base"
              placeholder="••••••••"
            />
          </motion.div>

          {/* Error state */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto", x: [0, -6, 6, -3, 3, 0] }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-xl border border-rose-300/55 bg-rose-100/85 p-3 text-sm text-rose-700">
                  <CircleAlert className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{loginError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="mt-2 h-12 w-full rounded-xl font-semibold text-base bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-300 hover:to-teal-300 shadow-[0_4px_20px_rgba(34,211,238,0.25)] hover:shadow-[0_4px_28px_rgba(34,211,238,0.35)] transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
