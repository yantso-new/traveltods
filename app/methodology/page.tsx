import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";

export const metadata: Metadata = {
  title: "Destination Scoring Methodology",
  description: "How TravelTods collects, evaluates, and presents family travel destination information and scores.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <TrustPage
      eyebrow="How it works"
      title="Our destination methodology"
      intro="TravelTods scores are planning signals, not guarantees. This page explains what they mean, where they come from, and how to use them responsibly."
    >
      <section>
        <h2>Signals we evaluate</h2>
        <ul className="mt-3">
          <li>Safety infrastructure and official travel-advisory context</li>
          <li>Playgrounds, parks, child-oriented attractions, and low-pressure activities</li>
          <li>Sidewalks, accessibility, walkability, and stroller practicality</li>
          <li>Weather comfort and seasonal conditions</li>
          <li>Food options and family-oriented cafés or restaurants</li>
          <li>Relative cost and affordability signals</li>
        </ul>
      </section>
      <section>
        <h2>How scores are produced</h2>
        <p className="mt-3">We combine structured public data, third-party destination information, and our own scoring rules. Source coverage varies by destination. A destination is eligible for search indexing only when its core data passes our reliability threshold and it includes substantive editorial context.</p>
      </section>
      <section>
        <h2>Automated data and editorial review</h2>
        <p className="mt-3">Some information is collected or summarized with automated systems. Automation can be incomplete or wrong, so published guidance should be reviewed against cited or official sources. We do not label content as parent-verified unless a distinct parent-verification record supports that claim.</p>
      </section>
      <section>
        <h2>Known limitations</h2>
        <ul className="mt-3">
          <li>City-wide averages may hide large neighborhood differences.</li>
          <li>Accessibility needs vary substantially between families.</li>
          <li>Prices, opening hours, weather, transport access, and safety conditions change.</li>
          <li>A numerical score cannot replace age-specific judgment or local advice.</li>
        </ul>
      </section>
      <section>
        <h2>Corrections</h2>
        <p className="mt-3">If you identify an error, email <a href="mailto:yanivtsoref@gmail.com">yanivtsoref@gmail.com</a> with the page URL, the incorrect detail, and a reliable supporting source.</p>
      </section>
    </TrustPage>
  );
}
