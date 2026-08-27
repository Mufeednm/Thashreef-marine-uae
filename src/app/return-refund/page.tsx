import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { Footer } from "@/features/storefront/components/storefront-experience";

export const metadata = { title: "Return & Refund Policy | Marsa Edge Marine LLC" };

export default function ReturnRefundPage(): ReactElement {
  return (
    <>
      <main className="min-h-dvh bg-[#f4f8fa] px-4 py-8 text-[#0a2540] sm:px-6 lg:py-12">
        <article className="mx-auto max-w-[1100px]">
          <Link className="text-sm font-bold text-[#0e7490] hover:underline" href="/">
            ← Back to shop
          </Link>
          <header className="mt-6 rounded-[2rem] bg-[#071827] px-6 py-9 text-white shadow-xl shadow-slate-950/10 sm:px-10">
            <p className="text-xs font-black tracking-[0.24em] text-cyan-200 uppercase">
              Customer support
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Return &amp; Refund Policy
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Clear information for returns, refunds, and cancellations from Marsa Edge Marine LLC.
            </p>
          </header>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            <PolicySection title="Returns">
              <p>You may request a return within 30 days of purchase.</p>
              <p>
                Start a return by emailing{" "}
                <a
                  className="font-semibold text-[#0e7490] underline"
                  href="mailto:sales@marsaedgemarine.ae"
                >
                  sales@marsaedgemarine.ae
                </a>{" "}
                or contacting us on WhatsApp with your order details. We will provide approval and
                instructions before you send an item back.
              </p>
              <p>
                Items must be unused, in original condition and packaging, with all accessories and
                documentation.
              </p>
              <p>
                Approved returns have a 10% restocking fee. Return shipping, customs duties, and
                related charges are the customer’s responsibility.
              </p>
              <p>Custom-ordered, non-stock, and made-to-order items cannot be returned.</p>
            </PolicySection>
            <PolicySection title="Refunds">
              <p>Once a returned item is received and inspected, we will notify you by email.</p>
              <p>
                Approved refunds are issued within 7–10 business days to the original payment
                method.
              </p>
              <p>
                For damaged, incomplete, or non-resalable returns, a reasonable deduction may be
                made for repair, replacement, or repackaging.
              </p>
            </PolicySection>
            <PolicySection title="Cancellations">
              <p>Orders may be cancelled before shipment is processed without penalty.</p>
              <p>
                Email{" "}
                <a
                  className="font-semibold text-[#0e7490] underline"
                  href="mailto:sales@marsaedgemarine.ae"
                >
                  sales@marsaedgemarine.ae
                </a>{" "}
                with your order number to request cancellation.
              </p>
              <p>After confirmation, cancellation refunds are processed within 48 hours.</p>
            </PolicySection>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function PolicySection({ children, title }: { children: ReactNode; title: string }): ReactElement {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}
