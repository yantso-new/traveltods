import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Design System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Internal component reference. Not part of the public site in production.
  if (process.env.NODE_ENV === "production") notFound();

  return children;
}
