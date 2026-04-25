import { StaticShell, Heading } from "@/components/shop/static-shell";

export const metadata = { title: "Privacy Policy · Dialawhip" };

export default function PrivacyPage() {
  return (
    <StaticShell
      eyebrow="Legal"
      title={<>Privacy <span className="italic font-light text-forest">policy</span>.</>}
      updated="24 April 2026"
      lead="How we collect, store, and use personal data — and your rights under UK GDPR."
    >
      <Heading>Data we collect</Heading>
      <p>
        We collect the data you give us: name, email, phone, delivery address,
        and uploaded identification documents. We collect order history,
        payment metadata (via Stripe), and limited device data for fraud
        prevention.
      </p>

      <Heading>How we use it</Heading>
      <p>
        To fulfil your orders, verify your eligibility to purchase
        age-restricted goods, and to satisfy our legal obligations under the
        Misuse of Drugs Act 2023 and Trading Standards requirements.
      </p>

      <Heading>Retention</Heading>
      <p>
        ID verification records are kept for 6 years after your last order, as
        required by regulatory audit. Order records are kept for 7 years for
        tax. You may request deletion of all other data at any time.
      </p>

      <Heading>Third parties</Heading>
      <p>
        We use Stripe (payments), Twilio (SMS), and Resend (email). Our
        infrastructure is hosted in the UK and EU. We do not sell your data.
      </p>

      <Heading>Your rights</Heading>
      <p>
        You have the right to access, correct, or delete your data, and to
        object to its processing. Contact <a className="text-forest underline underline-offset-4" href="mailto:privacy@dialawhip.com">privacy@dialawhip.com</a>.
      </p>
    </StaticShell>
  );
}
