import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";

const inter = Inter({
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uk-news.example.com";

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
