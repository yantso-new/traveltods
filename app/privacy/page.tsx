import type { Metadata } from "next";
import { TrustPage } from "@/components/TrustPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TravelTods handles email addresses, analytics data, saved destinations, and third-party services.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <TrustPage eyebrow="Last updated July 11, 2026" title="Privacy policy" intro="This policy explains the information TravelTods processes when you browse the site, save a destination, or join the email list.">
      <section>
        <h2>Information you provide</h2>
        <p className="mt-3">If you join the email list, we store your email address, signup source, and signup timestamps. If you contact us, we process the information included in your message.</p>
      </section>
      <section>
        <h2>Analytics and device information</h2>
        <p className="mt-3">We use Vercel Web Analytics to understand aggregate site usage and product interactions. Hosting and analytics providers may process technical information such as page URLs, device or browser attributes, timestamps, and approximate location derived from network information.</p>
      </section>
      <section>
        <h2>Saved destinations</h2>
        <p className="mt-3">Saved-destination preferences are currently stored in your browser using local storage. They are not an account and can be removed by clearing site data in your browser.</p>
      </section>
      <section>
        <h2>Service providers and external links</h2>
        <p className="mt-3">TravelTods uses service providers including Vercel and Convex, and may link to third-party booking, map, activity, image, or tourism websites. Their privacy policies govern information processed on their services.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p className="mt-3">You may request access, correction, or deletion of an email-list record by contacting <a href="mailto:yanivtsoref@gmail.com">yanivtsoref@gmail.com</a>. Applicable rights depend on your location.</p>
      </section>
    </TrustPage>
  );
}
