import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import SiteNav from "@/components/site-nav";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ variable: "--font-instrument-serif", weight: "400", subsets: ["latin"] });
const hankenGrotesk = Hanken_Grotesk({ variable: "--font-hanken-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whetstone",
  description: "An honest thinking partner.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${instrumentSerif.variable} ${hankenGrotesk.variable}`}>
        <ClerkProvider><SiteNav />{children}</ClerkProvider>
      </body>
    </html>
  );
}
