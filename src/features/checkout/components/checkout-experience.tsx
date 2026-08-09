"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { formatAedFromCents } from "@/shared/utils/currency";

interface StoredLine { id: string; name: string; sku: string; priceAedCents: number; quantity: number }
const steps = ["Customer", "Delivery", "Review", "Payment"] as const;

export function CheckoutExperience({ customer }: { customer: { name: string; email: string } }): ReactElement {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [complete, setComplete] = useState(false);
  const [payment, setPayment] = useState("cod");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setLines(JSON.parse(window.sessionStorage.getItem("thashreef-cart") ?? "[]") as StoredLine[]); } catch { setLines([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.priceAedCents * line.quantity, 0), [lines]);
  const shipping = subtotal > 0 ? 2500 : 0;
  const vat = Math.round((subtotal + shipping) * 0.05);
  const total = subtotal + shipping + vat;
  if (complete) return <Success total={total} />;
  return (
    <main className="min-h-dvh bg-[#f4f8fa] px-4 py-8 text-[#0a2540] sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-bold text-[#0e7490] hover:underline" href="/">← Continue shopping</Link>
        <header className="mt-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end"><div><p className="text-xs font-black tracking-[.24em] text-[#f97316] uppercase">Secure UAE checkout</p><h1 className="mt-2 text-4xl font-black tracking-tight">Complete your order</h1></div><p className="text-sm text-slate-600">AED · VAT included at checkout</p></header>
        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Checkout progress">{steps.map((label, index) => <li className={`rounded-xl px-2 py-3 text-center text-xs font-black sm:text-sm ${index === step ? "bg-[#071827] text-white" : index < step ? "bg-cyan-100 text-cyan-900" : "bg-white text-slate-400"}`} key={label}>{index + 1}. <span className="hidden sm:inline">{label}</span></li>)}</ol>
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            {step === 0 ? <CustomerForm customer={customer} /> : null}
            {step === 1 ? <AddressForm /> : null}
            {step === 2 ? <Review lines={lines} /> : null}
            {step === 3 ? <Payment payment={payment} setPayment={setPayment} /> : null}
            <div className="mt-8 flex justify-between gap-3 border-t border-slate-100 pt-6"><button className="min-h-11 rounded-full px-5 text-sm font-bold text-slate-600 disabled:opacity-40" disabled={step === 0} onClick={() => setStep((value) => value - 1)} type="button">Back</button><button className="min-h-11 rounded-full bg-[#f97316] px-6 text-sm font-black text-white transition hover:bg-[#c2410c] disabled:bg-slate-300" disabled={lines.length === 0} onClick={() => step === 3 ? setComplete(true) : setStep((value) => value + 1)} type="button">{step === 3 ? `Place order · ${payment === "cod" ? "Cash on delivery" : "Payment request"}` : "Continue"}</button></div>
          </section>
          <OrderSummary lines={lines} shipping={shipping} subtotal={subtotal} total={total} vat={vat} />
        </div>
      </div>
    </main>
  );
}
function CustomerForm({ customer }: { customer: { name: string; email: string } }): ReactElement { return <fieldset><legend className="text-2xl font-black">Customer details</legend><p className="mt-2 text-sm text-slate-500">We’ll use these details for order updates and delivery coordination.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field defaultValue={customer.name} label="Full name" name="name" /><Field defaultValue={customer.email} label="Email" name="email" type="email" /><Field label="Mobile number" name="phone" placeholder="+971 50 000 0000" type="tel" /></div></fieldset>; }
function AddressForm(): ReactElement { return <fieldset><legend className="text-2xl font-black">Shipping address</legend><p className="mt-2 text-sm text-slate-500">Choose your UAE delivery location. ZIP is optional in the UAE.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field defaultValue="United Arab Emirates" label="Country" name="country" /><Select label="Emirate" name="emirate" options={["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"]}/><Field label="City" name="city" /><Field label="Area" name="area" /><Field label="Building / villa" name="building" /><Field label="Street" name="street" /><Field label="Apartment (optional)" name="apartment" /><Field label="ZIP (optional)" name="zip" /></div></fieldset>; }
function Review({ lines }: { lines: StoredLine[] }): ReactElement { return <fieldset><legend className="text-2xl font-black">Review your order</legend>{lines.length ? <div className="mt-6 space-y-3">{lines.map((line) => <div className="flex justify-between rounded-2xl bg-slate-50 p-4" key={line.id}><div><p className="font-bold">{line.name}</p><p className="mt-1 text-xs text-slate-500">SKU {line.sku} · Qty {line.quantity}</p></div><strong>{formatAedFromCents(line.priceAedCents * line.quantity)}</strong></div>)}</div> : <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Your cart is empty. Return to the catalog to add products.</p>}</fieldset>; }
function Payment({ payment, setPayment }: { payment: string; setPayment: (value: string) => void }): ReactElement { const options = [["cod", "Cash on Delivery", "Pay when your UAE order arrives."], ["card", "Card payment", "Payment gateway handoff is prepared for a future provider."], ["stripe", "Stripe (coming soon)", "Saved as an integration-ready checkout option."], ["uae", "UAE payment gateway (coming soon)", "Prepared for local gateway integration."]] as const; return <fieldset><legend className="text-2xl font-black">Payment method</legend><p className="mt-2 text-sm text-slate-500">No live payment is processed in this demo.</p><div className="mt-6 space-y-3">{options.map(([value, title, detail]) => <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${payment === value ? "border-[#0e7490] bg-cyan-50" : "border-slate-200"}`} key={value}><input checked={payment === value} name="payment" onChange={() => setPayment(value)} type="radio" value={value}/><span><b>{title}</b><small className="mt-1 block text-slate-500">{detail}</small></span></label>)}</div></fieldset>; }
function OrderSummary({ lines, shipping, subtotal, total, vat }: { lines: StoredLine[]; shipping: number; subtotal: number; total: number; vat: number }): ReactElement { return <aside className="h-fit rounded-[2rem] bg-[#071827] p-6 text-white"><h2 className="text-xl font-black">Order summary</h2><p className="mt-1 text-sm text-slate-300">{lines.reduce((sum, line) => sum + line.quantity, 0)} item(s) in your basket</p><dl className="mt-6 space-y-3 border-y border-white/15 py-5 text-sm"><Row label="Subtotal" value={formatAedFromCents(subtotal)}/><Row label="UAE delivery" value={formatAedFromCents(shipping)}/><Row label="VAT (5%)" value={formatAedFromCents(vat)}/></dl><div className="mt-5 flex justify-between text-lg font-black"><span>Total</span><span>{formatAedFromCents(total)}</span></div><p className="mt-5 text-xs leading-5 text-slate-300">Secure customer details · Delivery confirmation before dispatch · Payment integrations are structured for activation.</p></aside>; }
function Row({ label, value }: { label: string; value: string }): ReactElement { return <div className="flex justify-between gap-3 text-slate-200"><dt>{label}</dt><dd className="font-bold text-white">{value}</dd></div>; }
function Field({ defaultValue, label, name, placeholder, type = "text" }: { defaultValue?: string; label: string; name: string; placeholder?: string; type?: string }): ReactElement { return <label className="block text-sm font-bold text-slate-700">{label}<input className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-[#0e7490] focus:bg-white" defaultValue={defaultValue} name={name} placeholder={placeholder} required={!label.includes("optional")} type={type}/></label>; }
function Select({ label, name, options }: { label: string; name: string; options: readonly string[] }): ReactElement { return <label className="block text-sm font-bold text-slate-700">{label}<select className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-[#0e7490]" name={name}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Success({ total }: { total: number }): ReactElement { return <main className="grid min-h-dvh place-items-center bg-[#eef5fa] p-5"><section className="max-w-lg rounded-[2rem] bg-white p-9 text-center shadow-xl"><p className="text-xs font-black tracking-[.24em] text-[#f97316] uppercase">Order request received</p><h1 className="mt-4 text-4xl font-black text-[#0a2540]">Thank you for your order.</h1><p className="mt-4 text-slate-600">Your order total is {formatAedFromCents(total)}. Our UAE marine team will confirm availability and payment details before dispatch.</p><Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#071827] px-6 text-sm font-black text-white" href="/">Return to storefront</Link></section></main>; }
