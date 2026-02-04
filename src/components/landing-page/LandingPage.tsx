import { memo } from "react";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Footer } from "./Footer";
import { Button } from "@/components/ui/button";

export const LandingPage = memo(function LandingPage() {
  return (
    <div className="w-full h-full bg-background text-foreground overflow-y-auto font-sans">
       <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-border">
          <div className="container mx-auto flex justify-between items-center h-16 px-4">
            <span className="font-bold text-xl text-primary">Brand</span>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Product</a>
                <a href="#" className="hover:text-foreground transition-colors">Solutions</a>
                <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            </nav>
            <div className="flex gap-4">
                <Button variant="ghost" size="sm">Log in</Button>
                <Button size="sm">Sign up</Button>
            </div>
          </div>
       </header>

       <Hero />
       <Features />
       <Footer />
    </div>
  );
});
