import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uk-news.example.com";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "UK News App",
  description:
    "Modern Next.js 14 news template conversion with reusable components.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "UK News App",
    description:
      "Modern Next.js 14 news template conversion with reusable components.",
    type: "website",
    url: "/",
    images: ["/images/news-placeholder.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "UK News App",
    description:
      "Modern Next.js 14 news template conversion with reusable components.",
    images: ["/images/news-placeholder.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', { send_page_view: false });
          `}
        </Script>
        <GoogleAnalytics measurementId={gaMeasurementId} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="container-padded py-4">
            <AdSlot size="728x90" placement="home_top_banner" />
          </div>
          <main className="container-padded flex-1 py-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
