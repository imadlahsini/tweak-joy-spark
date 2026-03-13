import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("fetch-subscriptions");
        if (error) throw error;
        setSubscriptions(data?.subscriptions ?? []);
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Active Stripe subscriptions</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Current Period End</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{sub.customer_email || "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-foreground">{sub.plan_name || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === "active"
                        ? "bg-green-500/10 text-green-600"
                        : sub.status === "trialing"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    ${(sub.amount / 100).toFixed(2)}/{sub.interval}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(sub.current_period_end).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No active subscriptions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;
