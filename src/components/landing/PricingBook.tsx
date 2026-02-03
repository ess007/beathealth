import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ECGPulse } from "./ECGLine";

interface Plan {
  name: string;
  price: string;
  period: string;
  subtitle?: string;
  for: string;
  features: string[];
  cta: string;
  popular?: boolean;
  variant: "outline" | "default" | "secondary";
}

const plans: Plan[] = [
  {
    name: "Beat Free",
    price: "₹0",
    period: "/month",
    for: "Getting started",
    features: [
      "BP & Sugar logging",
      "Basic HeartScore",
      "Morning & Evening rituals",
      "Medication reminders",
    ],
    cta: "Start Free",
    variant: "outline",
  },
  {
    name: "Beat Coach",
    price: "₹199",
    period: "/month",
    subtitle: "7-day free trial",
    for: "Personal health mastery",
    features: [
      "Everything in Free",
      "AI Health Coach",
      "Family Dashboard",
      "Drug interaction alerts",
      "Fall detection",
      "PDF reports for doctors",
    ],
    cta: "Start Trial",
    popular: true,
    variant: "default",
  },
  {
    name: "Beat Family",
    price: "₹349",
    period: "/month",
    for: "Whole family wellness",
    features: [
      "Everything in Coach",
      "Up to 5 family members",
      "Shared dashboard",
      "Priority support",
      "Teleconsult discounts",
    ],
    cta: "Get Family",
    variant: "secondary",
  },
];

export const PricingBook = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-landing-card">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-text mb-4">
            Simple. Honest. <span className="text-landing-primary">Fair.</span>
          </h2>
          <p className="text-landing-muted text-lg">
            Start free. No credit card needed.
          </p>
        </div>

        {/* Pricing cards as "ritual books" */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative bg-landing-bg rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "ring-2 ring-landing-primary shadow-xl shadow-landing-primary/10"
                  : "border border-landing-border hover:border-landing-primary/30"
              }`}
              style={{
                // "Book thickness" effect based on features
                boxShadow: plan.popular
                  ? undefined
                  : `0 ${4 + i * 2}px 0 -2px hsl(var(--landing-border))`,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-landing-primary to-landing-coral text-white text-xs font-bold py-2 text-center animate-pulse">
                  MOST POPULAR
                </div>
              )}

              {/* Bookmark for popular plan */}
              {plan.popular && (
                <div className="absolute -top-2 right-6 w-8 h-16 bg-landing-primary rounded-b-lg shadow-lg" />
              )}

              <div className={`p-6 lg:p-8 ${plan.popular ? "pt-14" : ""}`}>
                {/* Plan name */}
                <h3 className="font-semibold text-landing-text text-lg mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-landing-text font-mono">
                    {plan.price}
                  </span>
                  <span className="text-landing-muted text-sm">{plan.period}</span>
                </div>

                {/* Subtitle */}
                {plan.subtitle && (
                  <p className="text-xs text-landing-primary font-medium mb-4">
                    {plan.subtitle}
                  </p>
                )}
                {!plan.subtitle && <div className="h-5 mb-4" />}

                {/* For whom */}
                <p className="text-sm text-landing-muted mb-6">
                  For: {plan.for}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.popular
                            ? "text-landing-primary"
                            : plan.variant === "secondary"
                            ? "text-landing-secondary"
                            : "text-landing-secondary"
                        }`}
                      />
                      <span className="text-landing-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => navigate("/auth")}
                  variant={plan.variant}
                  className={`w-full rounded-full h-12 font-semibold ${
                    plan.popular
                      ? "bg-landing-primary hover:bg-landing-primary/90 text-white shadow-lg shadow-landing-primary/25"
                      : ""
                  }`}
                >
                  {plan.cta}
                  {plan.popular && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
