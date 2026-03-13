import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Unauthorized");

    const userId = claimsData.claims.sub;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roleCheck } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!roleCheck) throw new Error("Forbidden: admin only");

    // Fetch total revenue and order count
    const { data: orders } = await adminClient
      .from("orders")
      .select("amount, created_at, customer_name, customer_email, plan_slug, status, id");

    const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.amount), 0);
    const totalOrders = (orders ?? []).length;

    // This month's revenue
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthRevenue = (orders ?? [])
      .filter((o) => o.created_at >= monthStart)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    // Recent orders (last 10)
    const recentOrders = (orders ?? [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Active subscriptions count from Stripe
    let activeSubscriptions = 0;
    try {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });
      const subs = await stripe.subscriptions.list({ status: "active", limit: 1 });
      activeSubscriptions = subs.data.length > 0 ? (await stripe.subscriptions.list({ status: "active", limit: 100 })).data.length : 0;
    } catch (e) {
      console.error("Failed to fetch subscriptions count:", e);
    }

    return new Response(
      JSON.stringify({
        totalRevenue,
        totalOrders,
        activeSubscriptions,
        monthRevenue,
        recentOrders,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message === "Unauthorized" || error.message.includes("Forbidden") ? 403 : 500,
    });
  }
});
