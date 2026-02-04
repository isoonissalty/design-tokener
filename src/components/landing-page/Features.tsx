import { CheckCircle2, Zap, Layout, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

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
            <Card
              key={i}
              className="flex flex-col items-start"
            >
              <CardHeader>
                  <div className="text-primary mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {feature.title}
                  </h3>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
              </CardContent>
              <CardFooter className="mt-auto">
                  <a
                    href="#"
                    className="inline-flex items-center font-medium text-primary hover:underline"
                  >
                    Read more <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
