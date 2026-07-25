import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import RetiarAnalytics from "@/components/RetiarAnalytics";
import PreviewEditor from "@/components/PreviewEditor";
import { getSite } from "@/lib/live";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zoom Internet — Fast Wireless Broadband in Montego Bay, Jamaica",
  description:
    "Zoom Internet delivers fast, unlimited wireless broadband for homes and businesses across Montego Bay and western Jamaica. No contracts, no data caps. Internet just got a whole lot better!",
  openGraph: {
    title: "Zoom Internet — Internet just got a whole lot better!",
    description:
      "Fast, unlimited wireless broadband for homes and businesses in Montego Bay, Jamaica. No contracts. No data caps.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLive, company, design, preview, overrides } = await getSite();

  // Admin design overrides via CSS variables (inline = highest precedence).
  const colors = design?.colors as { primary?: string; accent?: string } | undefined;
  const fonts = design?.fonts as { heading?: string; body?: string } | undefined;
  const accent = colors?.accent || colors?.primary;
  const headingFont = fonts?.heading;
  const bodyFont = fonts?.body;
  const vars: Record<string, string> = {};
  if (accent) {
    vars["--color-zoom"] = accent;
    vars["--color-cyan"] = accent;
  }
  if (headingFont)
    vars["--font-display"] = `'${headingFont}', ui-sans-serif, system-ui, sans-serif`;
  if (bodyFont)
    vars["--font-sans"] = `'${bodyFont}', ui-sans-serif, system-ui, sans-serif`;
  const googleFonts = [headingFont, bodyFont].filter(Boolean) as string[];

  return (
    <html lang="en" className="antialiased" style={vars as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap"
        />
        {googleFonts.length > 0 && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?${googleFonts
              .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
              .join("&")}&display=swap`}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {preview && <PreviewEditor />}
        <RetiarAnalytics slug="zoom-internet-full" />
        {isLive ? (
          <>
            <Nav overrides={overrides} />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton phone={company.whatsapp} overrides={overrides} />
          </>
        ) : (
          <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl font-semibold">{company.name}</h1>
            <p className="mt-3 text-gray-500">This site is temporarily unavailable.</p>
            <p className="mt-1 text-sm text-gray-400">Please check back soon.</p>
          </main>
        )}
      </body>
    </html>
  );
}
