import { DesignTokens } from "@/types/tokens";

interface SectionProps {
  tokens: DesignTokens;
}

export function Footer({ tokens }: SectionProps) {
  return (
    <footer
      style={{
        paddingTop: `${tokens.spacing.large}px`,
        paddingBottom: `${tokens.spacing.large}px`,
        backgroundColor: tokens.colors.text, // Dark background
        color: "#ffffff",
      }}
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-bold text-lg">
          TokenBuilder
        </div>
        <div
          className="flex gap-8"
          style={{ fontSize: `${tokens.typography.body}px` }}
        >
          <span className="opacity-80 hover:opacity-100 cursor-pointer">Privacy</span>
          <span className="opacity-80 hover:opacity-100 cursor-pointer">Terms</span>
          <span className="opacity-80 hover:opacity-100 cursor-pointer">Contact</span>
        </div>
        <div className="opacity-50 text-sm">
          © {new Date().getFullYear()} TokenBuilder. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
