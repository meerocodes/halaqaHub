import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Layout/Header";
import Footer from "@/app/components/Layout/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";
import Aoscompo from "@/utils/aos";
import { AuthProvider } from "@/contexts/AuthContext";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Halaqa Hub - Live Classes & Community Knowledge",
  description: "Join daily halaqat, follow along with slides, and ask questions in real time. Connect with our community through knowledge and spiritual growth.",
  keywords: ["halaqa", "islamic learning", "community classes", "online education", "halaqah"],
  authors: [{ name: "Halaqa Hub" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://halaqahub.com",
    title: "Halaqa Hub - Live Classes & Community Knowledge",
    description: "Join daily halaqat, follow along with slides, and ask questions in real time. Connect with our community through knowledge and spiritual growth.",
    images: [
      {
        url: "https://halaqahub.com/social-image.jpg",
        width: 1200,
        height: 630,
        alt: "Halaqa Hub - Community Learning Platform",
        type: "image/jpeg",
      },
    ],
    siteName: "Halaqa Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Halaqa Hub - Live Classes & Community Knowledge",
    description: "Join daily halaqat, follow along with slides, and ask questions in real time.",
    images: ["https://halaqahub.com/social-image.jpg"],
  },
  alternates: {
    canonical: "https://halaqahub.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className}`}>
        <AuthProvider>
          <Aoscompo>
            <Header />
            <main className='pt-24'>
              {children}
            </main>
            <Footer />
          </Aoscompo>
          <ScrollToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
