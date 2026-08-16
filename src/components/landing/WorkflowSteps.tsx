import { ArrowRight, Crop, FileDown, Layers3, Upload } from "lucide-react";

const steps = [
  { icon: Upload, label: "Upload" },
  { icon: Layers3, label: "Organize" },
  { icon: Crop, label: "Clean" },
  { icon: FileDown, label: "Export" },
];

export function WorkflowSteps() {
  return (
    <section id="how-it-works" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-14">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2 shadow-sm">
              <step.icon className="size-4 text-primary" aria-hidden />
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 ? (
              <ArrowRight className="size-4 text-muted-foreground/70" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
