import Link from "next/link";
import { StaticShell, Heading } from "@/components/shop/static-shell";

export const metadata = { title: "Report Abuse · Dialawhip" };

export default function ReportAbusePage() {
  return (
    <StaticShell
      eyebrow="Safeguarding"
      title={<>Report <span className="italic font-light text-forest">abuse</span>.</>}
      lead="Believe a Dialawhip customer is misusing products, or supplying them to others? Tell us. Reports are confidential and we act on every one."
    >
      <Heading>How to report</Heading>
      <p>
        Email <a className="text-forest underline underline-offset-4" href="mailto:safeguarding@dialawhip.com">safeguarding@dialawhip.com</a> or call
        the confidential line on <a className="text-forest underline underline-offset-4" href="tel:01910000001">0191 000 0001</a>.
        If you believe a minor is at immediate risk, contact Northumbria
        Police on 999 first.
      </p>

      <Heading>What to include</Heading>
      <ul className="list-disc space-y-2 pl-6">
        <li>The name, address, or account email you're concerned about (if known).</li>
        <li>What you observed — when, where, what products.</li>
        <li>Photos or screenshots if you have them and they're safe to share.</li>
        <li>Your contact details (optional — reports can be anonymous).</li>
      </ul>

      <Heading>What happens next</Heading>
      <p>
        Every report is reviewed by a senior member of staff within 24
        hours. If we find evidence of misuse or supply, we ban the account,
        preserve order records, and pass the case to Northumbria Police and
        Trading Standards.
      </p>

      <Heading>If you're struggling</Heading>
      <p>
        If you or someone you love is misusing nitrous oxide and wants help:
        <br />
        <strong>FRANK</strong> — 0300 123 6600 (24/7 drug advice, confidential)<br />
        <strong>Samaritans</strong> — 116 123 (24/7 emotional support)
      </p>

      <p className="mt-6">
        <Link href="/contact" className="text-forest underline underline-offset-4">Prefer a web form? Use our contact page →</Link>
      </p>
    </StaticShell>
  );
}
