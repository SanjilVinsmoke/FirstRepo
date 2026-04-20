import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    features: [
      "Up to 10 MB per file",
      "Draco + Meshopt compression",
      "5 jobs per session history",
      "Community support",
    ],
    cta: "Start for free",
    href: "/dashboard",
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    highlight: true,
    features: [
      "Up to 200 MB per file",
      "All compression methods (incl. KTX2)",
      "Batch upload (up to 20 files)",
      "Unlimited history",
      "API key access",
      "Priority processing",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    href: "#",
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    highlight: false,
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "500 MB per file",
      "Dedicated queue",
      "SSO / magic-link auth",
      "SLA + Slack support",
    ],
    cta: "Contact us",
    href: "mailto:hello@meshshrink.dev",
  },
];

export default function PricingPage() {
  return (
    <div className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-gray-400 text-lg">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? "border-brand-500 bg-brand-500/5 shadow-xl shadow-brand-500/10"
                  : "border-gray-800 bg-gray-900/60"
              }`}
            >
              {plan.highlight && (
                <span className="inline-block self-start rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white mb-4">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-2 text-sm">/{plan.period}</span>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-brand-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block rounded-lg px-6 py-3 text-center font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          Stripe integration coming soon. All plans currently free during beta.
        </p>
      </div>
    </div>
  );
}
