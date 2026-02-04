import { DesignTokens } from "@/types/tokens";
import { CheckCircle2, Zap, Layout, ArrowRight } from "lucide-react";

interface SectionProps {
  tokens: DesignTokens;
}

export function Features({ tokens }: SectionProps) {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Iteration",
      description: "Instantly see how your changes affect the entire look and feel of your application.",
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Responsive Design",
      description: "Our tokens work perfectly across all device sizes and screen resolutions.",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Production Ready",
      description: "Export clean, optimized Tailwind config files ready for your production build.",
    },
  ];

  return (
    <section
      style={{
        paddingTop: `${tokens.spacing.container}px`,
        paddingBottom: `${tokens.spacing.container}px`,
        backgroundColor: "#f8fafc", // A slight offset from pure white usually
        color: tokens.colors.text,
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2
            style={{
              fontSize: `${tokens.typography.h2}px`,
              marginBottom: `${tokens.spacing.medium}px`,
            }}
            className="font-bold"
          >
            Everything you need
          </h2>
          <p
            style={{
              fontSize: `${tokens.typography.body}px`,
              color: tokens.colors.secondary,
            }}
          >
            A complete toolkit for your design system
          </p>
        </div>

        <div
          className="grid md:grid-cols-3"
          style={{ gap: `${tokens.spacing.large}px` }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                backgroundColor: tokens.colors.background,
                padding: `${tokens.spacing.large}px`,
                borderRadius: `${tokens.borderRadius.large}px`,
              }}
              className="shadow-sm border border-slate-100 flex flex-col items-start"
            >
              <div
                style={{
                  color: tokens.colors.primary,
                  marginBottom: `${tokens.spacing.medium}px`,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: `${tokens.typography.body + 4}px`, // Slightly larger than body
                  marginBottom: `${tokens.spacing.small}px`,
                }}
                className="font-semibold"
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: `${tokens.typography.body}px`,
                  color: tokens.colors.secondary,
                  marginBottom: `${tokens.spacing.medium}px`,
                }}
              >
                {feature.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center mt-auto font-medium hover:underline"
                style={{
                    color: tokens.colors.primary,
                    fontSize: `${tokens.typography.body}px`
                }}
              >
                Read more <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
