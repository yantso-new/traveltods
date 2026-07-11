import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "TravelTods editorial standards for sourcing, corrections, automation, reviews, and commercial independence.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <TrustPage eyebrow="Trust" title="Editorial policy" intro="Our usefulness depends on being clear about what we know, what we infer, and how commercial relationships affect the site.">
      <section>
        <h2>Accuracy and sourcing</h2>
        <p className="mt-3">We prioritize official operators, transport providers, tourism authorities, government guidance, and clearly identified first-hand reports. Time-sensitive facts should include a review or update date.</p>
      </section>
      <section>
        <h2>First-hand experience</h2>
        <p className="mt-3">We distinguish editorial research from first-hand parent experience. Future community contributions will identify the child ages, travel period, and verification status supplied with a review.</p>
      </section>
      <section>
        <h2>Automation and AI</h2>
        <p className="mt-3">Automated tools may assist research, classification, drafting, and data processing. They do not remove our responsibility to verify important claims, disclose limitations, and correct errors.</p>
      </section>
      <section>
        <h2>Commercial independence</h2>
        <p className="mt-3">Affiliate availability or commission should not determine a destination score. Paid placements must be labeled, and sponsored partners do not receive editorial approval rights over independent findings.</p>
      </section>
      <section>
        <h2>Corrections</h2>
        <p className="mt-3">Material errors should be corrected promptly. Send correction requests to <a href="mailto:yanivtsoref@gmail.com">yanivtsoref@gmail.com</a>.</p>
      </section>
    </TrustPage>
  );
}
