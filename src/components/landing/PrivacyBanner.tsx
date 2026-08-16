import Link from "next/link";

export function PrivacyBanner() {
  return (
    <section id="privacy" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 text-center">
      <p className="text-sm font-medium text-foreground">Private by default</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your screenshots are processed locally in your browser.
      </p>
      <Link
        href="/create?demo=true"
        className="mt-6 inline-flex text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline"
      >
        Try with demo screenshots
      </Link>
    </section>
  );
}
