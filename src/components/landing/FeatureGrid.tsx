import { Crop, FileStack, GripVertical, Lock, UserRoundX } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Drag & reorder",
    description: "Put your screenshots in exactly the right order.",
    icon: GripVertical,
    className: "sm:col-span-2",
  },
  {
    title: "Crop & rotate",
    description: "Clean screenshots before exporting.",
    icon: Crop,
  },
  {
    title: "Study-ready PDFs",
    description: "Turn dozens of screenshots into one organized document.",
    icon: FileStack,
    className: "sm:col-span-2",
  },
  {
    title: "Private by default",
    description: "Your files stay on your device.",
    icon: Lock,
  },
  {
    title: "No signup",
    description: "Open the tool and start working.",
    icon: UserRoundX,
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16">
      <div className="grid gap-3 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className={cn(
              "rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-colors duration-200",
              feature.className
            )}
          >
            <feature.icon className="mb-4 size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold tracking-tight">{feature.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
