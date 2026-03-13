import { plans } from "@/data/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";

const AdminLinks = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const origin = window.location.origin;

  const standardPlans = plans.filter((p) => !p.hidden);
  const specialPlans = plans.filter((p) => p.hidden);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "Link copied!", description: "Ready to share." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const LinkRow = ({ url, id, label }: { url: string; id: string; label: string }) => (
    <div className="flex items-center justify-between gap-2 py-2 px-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => copyToClipboard(url, id)}
        >
          {copiedId === id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );

  const PlanCard = ({ plan }: { plan: (typeof plans)[0] }) => {
    const links: { url: string; id: string; label: string }[] = [
      { url: `${origin}/checkout/${plan.slug}`, id: `${plan.slug}-onetime`, label: "One-Time" },
    ];

    if (plan.subscriptionPriceId) {
      links.push({
        url: `${origin}/checkout/${plan.slug}?type=subscription`,
        id: `${plan.slug}-sub`,
        label: "Subscription",
      });
    }

    // Only add bundle links if plan has bundlePriceIds
    if (plan.bundlePriceIds) {
      const basePrice = plan.monthlyPrice;
      const discounted = basePrice * 0.85;

      links.push({
        url: `${origin}/checkout/${plan.slug}?websites=2`,
        id: `${plan.slug}-bundle-2`,
        label: `2 Sites — $${(basePrice + discounted).toFixed(2)}`,
      });

      links.push({
        url: `${origin}/checkout/${plan.slug}?websites=3`,
        id: `${plan.slug}-bundle-3`,
        label: `3 Sites — $${(basePrice + discounted * 2).toFixed(2)}`,
      });
    }

    return (
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-1 sm:pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <span className="text-sm text-muted-foreground">${plan.monthlyPrice}</span>
            </div>
            {plan.badge && <Badge variant="secondary">{plan.badge}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {links.map((link) => (
            <LinkRow key={link.id} {...link} />
          ))}
        </CardContent>
      </Card>
    );
  };

  const hasSpecial = specialPlans.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Link2 className="w-5 h-5 text-primary" />
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Checkout Links</h1>
      </div>

      {hasSpecial ? (
        <Tabs defaultValue="standard">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="standard" className="flex-1 sm:flex-none">Standard ({standardPlans.length})</TabsTrigger>
            <TabsTrigger value="special" className="flex-1 sm:flex-none">Special ({specialPlans.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="standard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              {standardPlans.map((plan) => <PlanCard key={plan.slug} plan={plan} />)}
            </div>
          </TabsContent>
          <TabsContent value="special">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              {specialPlans.map((plan) => <PlanCard key={plan.slug} plan={plan} />)}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {standardPlans.map((plan) => <PlanCard key={plan.slug} plan={plan} />)}
        </div>
      )}
    </div>
  );
};

export default AdminLinks;
