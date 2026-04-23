import { StaticShell, Heading } from "@/components/shop/static-shell";

export const metadata = { title: "N₂O Chargers Agreement · Dialawhip" };

export default function N2oAgreementPage() {
  return (
    <StaticShell
      eyebrow="Legal · Binding"
      title={<>N₂O chargers <span className="italic font-light text-forest">agreement</span>.</>}
      updated="24 April 2026"
      lead="By purchasing nitrous oxide products from Dialawhip, you agree to the following terms. These terms exist to keep our supply lawful and to protect public safety."
    >
      <Heading>1. Legal status of nitrous oxide</Heading>
      <p>
        Nitrous oxide (N₂O) is classified as a Class C controlled substance
        under the Misuse of Drugs Act 1971, following the amendment that
        came into force on 8 November 2023. Possession for the purpose of
        psychoactive consumption is a criminal offence punishable by up to
        two years' imprisonment. Supply carries up to fourteen years.
      </p>

      <Heading>2. Permitted use</Heading>
      <p>
        Dialawhip supplies nitrous oxide <strong>solely for use in
        professional and domestic catering preparations</strong> — the whipping
        of cream, the aeration of foams, espumas, sauces, and similar
        culinary applications. No other use is authorised or supplied for.
      </p>

      <Heading>3. Declaration of use</Heading>
      <p>By completing a purchase you declare, under the Fraud Act 2006, that:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>You are 18 years of age or older.</li>
        <li>The ID document you have provided is genuine and belongs to you.</li>
        <li>You intend to use the product exclusively for culinary preparation.</li>
        <li>You will not consume, inhale, or otherwise misuse the product.</li>
        <li>You will not supply, gift, or sell the product to any third party.</li>
        <li>You will store the product out of reach of children and minors.</li>
      </ul>

      <Heading>4. ID verification</Heading>
      <p>
        We require government-issued photographic identification before first
        purchase. Accepted documents: UK driving licence, passport (any
        nationality), UK biometric residency card, CitizenCard, UK military
        ID. We retain a copy for 6 years as required by law enforcement.
      </p>

      <Heading>5. Reporting</Heading>
      <p>
        Any suspicious order pattern, resale indicators, or misuse evidence
        will be reported to Northumbria Police and Trading Standards. We
        cooperate fully with police requests and court orders.
      </p>

      <Heading>6. Right to refuse</Heading>
      <p>
        We may refuse service at any time, without explanation. Drivers are
        instructed to refuse delivery if the recipient appears intoxicated,
        cannot produce matching ID on arrival, or raises safety concerns.
      </p>

      <Heading>7. Acknowledgement</Heading>
      <p>
        By proceeding to checkout with any age-restricted product in your
        basket, you acknowledge that you have read and understood this
        agreement and agree to be bound by its terms.
      </p>
    </StaticShell>
  );
}
