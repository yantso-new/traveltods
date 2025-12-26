import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import ConvexClientProvider from "./ConvexClientProvider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LittleExplorer - Kids Travel Directory",
  description: "Discover amazing kid-friendly destinations around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} antialiased font-sans bg-stone-50 min-h-screen flex flex-col`}
      >
        <ConvexClientProvider>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
