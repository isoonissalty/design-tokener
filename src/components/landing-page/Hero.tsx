import { DesignTokens } from "@/types/tokens";

interface SectionProps {
  tokens: DesignTokens;
}

export function Hero({ tokens }: SectionProps) {
  return (
    <section
      style={{
        paddingTop: `${tokens.spacing.container}px`,
        paddingBottom: `${tokens.spacing.container}px`,
        backgroundColor: tokens.colors.background,
        color: tokens.colors.text,
      }}
      className="text-center"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <h1
          style={{
            fontSize: `${tokens.typography.h1}px`,
            marginBottom: `${tokens.spacing.large}px`,
            lineHeight: 1.1,
          }}
          className="font-bold tracking-tight"
        >
          Build Beautiful Products <br />
          <span style={{ color: tokens.colors.primary }}>With Custom Tokens</span>
        </h1>
        <p
          style={{
            fontSize: `${tokens.typography.body}px`,
            marginBottom: `${tokens.spacing.large}px`,
            color: tokens.colors.secondary,
          }}
          className="max-w-2xl mx-auto"
        >
          Stop struggling with hardcoded values. Use our token generator to visualize and export your design system in seconds.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            style={{
              backgroundColor: tokens.colors.primary,
              color: "#ffffff",
              padding: `${tokens.spacing.medium}px ${tokens.spacing.large}px`,
              borderRadius: `${tokens.borderRadius.medium}px`,
              fontSize: `${tokens.typography.body}px`,
            }}
            className="font-semibold transition-opacity hover:opacity-90"
          >
            Get Started
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: tokens.colors.text,
              border: `1px solid ${tokens.colors.secondary}`,
              padding: `${tokens.spacing.medium}px ${tokens.spacing.large}px`,
              borderRadius: `${tokens.borderRadius.medium}px`,
              fontSize: `${tokens.typography.body}px`,
            }}
            className="font-semibold transition-colors hover:bg-gray-100"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
