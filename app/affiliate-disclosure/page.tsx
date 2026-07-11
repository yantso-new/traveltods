import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How TravelTods uses affiliate links and protects the independence of destination recommendations.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <TrustPage eyebrow="Commercial transparency" title="Affiliate disclosure" intro="Some links may earn TravelTods a commission when you make a purchase or booking, at no additional cost to you.">
      <section>
        <h2>How affiliate links work</h2>
        <p className="mt-3">TravelTods may link to activity, accommodation, transport, insurance, or travel-product providers. If an eligible transaction follows one of those links, the provider may pay us a commission.</p>
      </section>
      <section>
        <h2>Our editorial rule</h2>
        <p className="mt-3">Commission availability does not determine destination scores. We aim to recommend options because they are relevant to families, not because they pay the highest rate. Commercial or sponsored placements will be labeled near the recommendation.</p>
      </section>
      <section>
        <h2>Verify before booking</h2>
        <p className="mt-3">Prices, availability, cancellation conditions, age restrictions, and accessibility details are controlled by the provider. Confirm them on the provider’s website before completing a booking.</p>
      </section>
    </TrustPage>
  );
}
