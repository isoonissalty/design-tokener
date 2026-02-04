import { memo } from "react";
import { DesignTokens } from "@/types/tokens";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Footer } from "./Footer";

interface LandingPageProps {
  tokens: DesignTokens;
}

export const LandingPage = memo(function LandingPage({ tokens }: LandingPageProps) {
  return (
    <div className="w-full h-full bg-white overflow-y-auto">
       {/* Simple Navbar mock */}
       <header
         className="border-b"
         style={{
             padding: `${tokens.spacing.medium}px`,
             borderColor: tokens.colors.secondary + "20" // 20 hex alpha
         }}
       >
          <div className="container mx-auto flex justify-between items-center">
            <span className="font-bold text-xl" style={{ color: tokens.colors.primary }}>Brand</span>
            <nav className="hidden md:flex gap-6" style={{ fontSize: `${tokens.typography.body}px`, color: tokens.colors.text }}>
                <a href="#">Product</a>
                <a href="#">Solutions</a>
                <a href="#">Pricing</a>
            </nav>
          </div>
       </header>

       <Hero tokens={tokens} />
       <Features tokens={tokens} />
       <Footer tokens={tokens} />
    </div>
  );
});
