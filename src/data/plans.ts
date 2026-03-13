export interface Plan {
  name: string;
  slug: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  priceId: string;
  subscriptionPriceId?: string;
  subscriptionInterval?: string;
  hidden?: boolean;
  bundlePriceIds?: { 2: string; 3: string };
}

export const DISCOUNT_PERCENT = 15;

export function getBundleTotal(basePrice: number, websites: number): number {
  if (websites <= 1) return basePrice;
  const extraSites = websites - 1;
  return basePrice + basePrice * 0.85 * extraSites;
}

export const plans: Plan[] = [
  {
    name: "1 Month",
    slug: "1-month",
    monthlyPrice: 14.99,
    description: "Quick start to test the waters",
    features: [
      "Full AI SEO Audit",
      "On-page optimization",
      "Performance report",
      "Email support",
    ],
    priceId: "price_1T3FeuIxoz9ozxaGX1jYlhbF",
    subscriptionPriceId: "price_1T83cFIxoz9ozxaGuogLUdoQ",
    subscriptionInterval: "mo",
    bundlePriceIds: {
      2: "price_1T88F5Ixoz9ozxaGHRHIYWbn",
      3: "price_1T88GMIxoz9ozxaGHQBNQcJh",
    },
  },
  {
    name: "3 Months",
    slug: "3-months",
    monthlyPrice: 39.99,
    description: "Short-term commitment with results",
    features: [
      "Everything in 1 Month",
      "Keyword tracking",
      "Competitor analysis",
      "Monthly reporting",
    ],
    priceId: "price_1T3FfHIxoz9ozxaGfWjsX0Xt",
    subscriptionPriceId: "price_1T87SSIxoz9ozxaGPQAQE6q7",
    subscriptionInterval: "mo",
    bundlePriceIds: {
      2: "price_1T5VwxIxoz9ozxaGwzt71JkS",
      3: "price_1T88IyIxoz9ozxaGBENXjdbi",
    },
  },
  {
    name: "6 Months",
    slug: "6-months",
    monthlyPrice: 49.99,
    description: "Most popular choice for growth",
    features: [
      "Everything in 3 Months",
      "Content strategy",
      "Link building",
      "Bi-weekly calls",
      "Priority support",
    ],
    badge: "Best Value",
    priceId: "price_1T3FflIxoz9ozxaGR6OErmJ1",
    subscriptionPriceId: "price_1T87SSIxoz9ozxaGb0JlgrSI",
    subscriptionInterval: "mo",
    bundlePriceIds: {
      2: "price_1T88JeIxoz9ozxaG55XkbnyZ",
      3: "price_1T88NKIxoz9ozxaGaeLkzQDX",
    },
  },
  {
    name: "1 Year",
    slug: "1-year",
    monthlyPrice: 89.99,
    description: "Maximum value with full service",
    features: [
      "Everything in 6 Months",
      "Full SEO maintenance",
      "Quarterly audits",
      "Dedicated account manager",
      "Weekly strategy calls",
    ],
    featured: true,
    badge: "Popular",
    priceId: "price_1T3FfwIxoz9ozxaGz9sy2Zgo",
    subscriptionPriceId: "price_1T86tRIxoz9ozxaGUVdo3R3L",
    subscriptionInterval: "yr",
    bundlePriceIds: {
      2: "price_1T88O8Ixoz9ozxaGlWgSN5IH",
      3: "price_1T88OWIxoz9ozxaGsACKe2eI",
    },
  },
  {
    name: "1 Year Special",
    slug: "1-year-special",
    monthlyPrice: 166.9,
    description: "Full year of AI SEO at a special rate",
    features: [
      "Everything in 6 Months",
      "Full SEO maintenance",
      "Quarterly audits",
      "Dedicated account manager",
      "Weekly strategy calls",
    ],
    priceId: "price_1T4AXcIxoz9ozxaGXLQSBwLn",
    hidden: true,
  },
  {
    name: "3 Months – 2 Websites",
    slug: "3-months-2-websites",
    monthlyPrice: 73.98,
    description: "SEO for 2 websites — second site saves 15%",
    features: [
      "Everything in 3 Months",
      "Keyword tracking",
      "Competitor analysis",
      "Monthly reporting",
      "2 websites covered",
      "15% off second website",
    ],
    priceId: "price_1T5VwxIxoz9ozxaGwzt71JkS",
    hidden: true,
  },
];
