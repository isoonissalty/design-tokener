import { memo } from "react";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { ComponentShowcase } from "./ComponentShowcase";
import { Footer } from "./Footer";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface LandingPageProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const LandingPage = memo(function LandingPage({ isDark, toggleTheme }: LandingPageProps) {
  return (
    <div className={`w-full h-full bg-background text-foreground overflow-y-auto font-sans ${isDark ? "dark" : ""}`}>
       <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-border">
          <div className="container mx-auto flex justify-between items-center h-16 px-4">
            <span className="font-bold text-xl">Brand</span>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Product</a>
                <a href="#" className="hover:text-foreground transition-colors">Solutions</a>
                <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            </nav>
            <div className="flex gap-4 items-center">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm">Log in</Button>
                <Button size="sm">Sign up</Button>
            </div>
          </div>
       </header>

       <Hero />
       <Features />
       <ComponentShowcase />
       <Footer />
    </div>
  );
});
