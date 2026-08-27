import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { ContactForm } from "@/features/contact/components/contact-form";
import { Footer } from "@/features/storefront/components/storefront-experience";

const whatsappUrl = "https://wa.me/971527035250";
const instagramUrl = "https://www.instagram.com/marsaedgemarine?igsi=MXJ5YjlxaXY0YW91ag==";

export default function ContactPage(): ReactElement {
  return (
    <>
      <main className="min-h-dvh bg-[#f4f8fa] px-4 py-8 text-[#0a2540] sm:px-6 lg:py-12">
        <section className="mx-auto max-w-[1480px]">
          <Link className="text-sm font-bold text-[#0e7490] hover:underline" href="/">
            ← Back to shop
          </Link>
          <div className="mt-6 overflow-hidden rounded-[2rem] bg-[#071827] px-6 py-10 text-white shadow-xl shadow-slate-950/15 sm:px-10 lg:px-14">
            <p className="text-xs font-black tracking-[0.24em] text-cyan-200 uppercase">
              Marsa Edge Marine LLC
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
              Contact our marine support team.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Need help finding the right marine part, arranging a bulk quote, or following up on an
              order? Send a message and our team will reply.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <ContactForm />
            <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-950/5 sm:p-9">
              <p className="text-xs font-black tracking-[0.2em] text-[#f97316] uppercase">
                Fast support
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Need help right away?</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                WhatsApp is the quickest way to check stock, request a bulk quote, or follow up on
                an order.
              </p>
              <a
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#25d366] px-6 text-sm font-black text-white transition hover:bg-[#1ebe57]"
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                Chat on WhatsApp · 052 703 5250
              </a>
              <dl className="mt-6 space-y-5 text-sm">
                <ContactDetail label="Call us / WhatsApp">
                  <a className="font-bold text-[#0e7490] hover:underline" href="tel:+971527035250">
                    +971 52 703 5250
                  </a>
                </ContactDetail>
                <ContactDetail label="Email">
                  <a
                    className="font-bold text-[#0e7490] hover:underline"
                    href="mailto:sales@marsaedgemarine.ae"
                  >
                    sales@marsaedgemarine.ae
                  </a>
                </ContactDetail>
                <ContactDetail label="Address">
                  Al Jaddaf Drydocks, Dubai, United Arab Emirates
                </ContactDetail>
                <ContactDetail label="Instagram">
                  <a
                    className="font-bold text-[#0e7490] hover:underline"
                    href={instagramUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    @marsaedgemarine
                  </a>
                </ContactDetail>
              </dl>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ContactDetail({ children, label }: { children: ReactNode; label: string }): ReactElement {
  return (
    <div>
      <dt className="font-black tracking-wide text-slate-900 uppercase">{label}</dt>
      <dd className="mt-1 leading-6 text-slate-600">{children}</dd>
    </div>
  );
}
