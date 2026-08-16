"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 pt-16 text-center sm:pt-20">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
        Turn your study screenshots into clean PDFs.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
        Upload screenshots, organize them, clean them up, and export one study-ready PDF.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="h-10 px-4" nativeButton={false} render={<Link href="/create" />}>
          Create a Study PDF
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="outline" className="h-10 px-4" nativeButton={false} render={<a href="#how-it-works" />}>
          How it works
        </Button>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        No signup. Files stay on your device.
      </p>
    </section>
  );
}
