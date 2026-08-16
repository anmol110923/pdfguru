import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Script from "next/script";
import { AppToaster } from "@/components/app-toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const GITHUB_PAGES_HOST = "anmol110923.github.io";
const CUSTOM_DOMAIN = "https://pdfguru.meraipu.in";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "PDFguru by MeraIPU",
  description: "Turn your study screenshots into clean PDFs. Private by default.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <Script id="github-pages-redirect" strategy="beforeInteractive">
        {`if(location.hostname==="${GITHUB_PAGES_HOST}"){var p=location.pathname;if(p==="/pdfguru"||p.startsWith("/pdfguru/")){location.replace("${CUSTOM_DOMAIN}"+(p==="/pdfguru"?"/":p.slice(8))+location.search+location.hash);}}`}
      </Script>
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <TooltipProvider delay={250}>
            {children}
            <AppToaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
