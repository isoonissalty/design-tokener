import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="py-32 bg-background text-foreground text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">
          Build Beautiful Products <br />
          <span className="text-primary">With Custom Tokens</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
          Stop struggling with hardcoded values. Use our token generator to visualize and export your design system in seconds.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button variant="secondary" size="lg">Learn More</Button>
        </div>
      </div>
    </section>
  );
}
