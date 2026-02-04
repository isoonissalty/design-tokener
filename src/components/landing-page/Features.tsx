import { CheckCircle2, Zap, Layout, ArrowRight } from "lucide-react";

export function Features() {
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
    <section className="py-24 bg-muted/50 text-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete toolkit for your design system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-card text-card-foreground p-8 rounded-lg shadow-sm border border-border flex flex-col items-start"
            >
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center mt-auto font-medium text-primary hover:underline"
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
