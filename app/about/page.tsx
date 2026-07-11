import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";

export const metadata: Metadata = {
  title: "About TravelTods",
  description: "Why TravelTods exists and how it helps parents evaluate destinations for trips with young children.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <TrustPage
      eyebrow="About TravelTods"
      title="Family travel decisions need better information"
      intro="TravelTods helps parents compare destinations using the practical details that broad travel guides often miss."
    >
      <section>
        <h2>Why we built it</h2>
        <p className="mt-3">A destination can look beautiful and still be exhausting with a stroller, an early bedtime, a picky eater, or children at different ages. TravelTods brings those constraints into the planning process before a family commits time and money.</p>
      </section>
      <section>
        <h2>What we are building</h2>
        <p className="mt-3">Our goal is a decision tool for families, combining destination data, practical editorial guidance, local places, activities, neighborhood context, and eventually clearly labeled feedback from parents who have visited.</p>
      </section>
      <section>
        <h2>What TravelTods is not</h2>
        <p className="mt-3">TravelTods is not a substitute for official safety, health, visa, accessibility, transport, or weather advice. Conditions change. Always verify important details with official sources and service providers before booking.</p>
      </section>
    </TrustPage>
  );
}
