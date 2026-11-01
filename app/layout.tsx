import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CaseCraft | Designer Phone Cases",
  description: "Premium phone cases for iPhone and Galaxy. Pick your phone, pick your case.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem-5rem)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
