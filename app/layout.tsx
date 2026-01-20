import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import ConvexClientProvider from "./ConvexClientProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TravelTods - Family Travel Made Easy",
  description: "Discover top-rated, safe, and engaging destinations perfect for kids under 10.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${plusJakartaSans.variable} antialiased font-display bg-background-light text-text-main-light min-h-screen flex flex-col transition-colors duration-200`}
      >
        <ConvexClientProvider>
          <main className="flex-grow">
            {children}
          </main>
          {/* Footer is handled in individual pages or we can keep it here. 
              The user design has a footer in the HTML. 
              Existing codebase had <Footer />, let's check if we should keep it or replace it. 
              For now, keeping the structure but the inner content might need updates. 
              However, the user request provided a full HTML page including header/footer. 
              I should probably NOT check <Footer /> here if I want to match the provided HTML exactly on the page level, 
              but typically layout handles this. 
              Let's keep the <main> wrapper. structure consistent. 
          */}
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
