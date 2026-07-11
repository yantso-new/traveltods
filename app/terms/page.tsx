import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of TravelTods destination information, scores, external links, and community features.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <TrustPage eyebrow="Last updated July 11, 2026" title="Terms of use" intro="By using TravelTods, you agree to use the information as a planning aid and to verify important travel details independently.">
      <section>
        <h2>Planning information, not professional advice</h2>
        <p className="mt-3">TravelTods does not provide legal, medical, safety, accessibility, financial, or immigration advice. Destination scores and recommendations are estimates based on available information and may contain errors or become outdated.</p>
      </section>
      <section>
        <h2>Bookings and third parties</h2>
        <p className="mt-3">Bookings and purchases are made with third-party providers. Their prices, availability, terms, refund policies, and service quality are outside TravelTods’ control.</p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <ul className="mt-3">
          <li>Do not disrupt, scrape at unreasonable volume, or attempt unauthorized access to the service.</li>
          <li>Do not submit unlawful, misleading, abusive, or rights-infringing community content.</li>
          <li>Do not present TravelTods scores or content as official government or safety guidance.</li>
        </ul>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p className="mt-3">We may update the service or these terms as the product develops. Questions can be sent to <a href="mailto:yanivtsoref@gmail.com">yanivtsoref@gmail.com</a>.</p>
      </section>
    </TrustPage>
  );
}
