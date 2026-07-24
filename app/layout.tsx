import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import RetiarAnalytics from "@/components/RetiarAnalytics";
import { company } from "@/lib/content";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <RetiarAnalytics slug="zoom-internet-full" />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton phone={company.whatsapp} />
      </body>
    </html>
  );
}
