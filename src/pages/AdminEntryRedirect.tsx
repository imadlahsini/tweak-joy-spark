import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { supabase } from "@/integrations/supabase/client";

const AdminEntryRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
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
        navigate("/admin/login", { replace: true });
        return;
      }

      navigate("/admin/login", { replace: true });
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="admin-theme admin-shell-bg relative flex min-h-screen items-center justify-center overflow-hidden text-foreground">
      <FloatingOrb className="bg-cyan-500/15 top-[15%] left-[10%]" size="w-72 h-72" />
      <FloatingOrb className="bg-teal-500/10 bottom-[10%] right-[15%]" size="w-80 h-80" delay={1} />

      <div className="flex flex-col items-center gap-4">
        <div className="admin-icon-plate h-14 w-14 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-cyan-700" />
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking admin access...
        </div>
      </div>
    </div>
  );
};

export default AdminEntryRedirect;
