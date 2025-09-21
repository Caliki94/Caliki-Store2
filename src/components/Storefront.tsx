"use client";
import React, { useMemo, useState } from "react";
import { priceInCurrency, fmt, EX_RATE } from "@/lib/currency";
import { classNames } from "@/lib/utils";

const REGIONS = [
  { code: "US", name: "United States", currency: "USD", locale: "en-US" },
  { code: "PL", name: "Polska", currency: "PLN", locale: "pl-PL" },
] as const;

const PRODUCTS = [
  { id:"classic", name:"Classic Piqué Polo", subtitle:"Staple. Breathable. Impeccable drape.", baseUSD:69,
    colors:[{key:"navy",label:"Navy",hex:"#0a2342",img:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"}],
    sizes:["S","M","L","XL"], badge:"Bestseller" },
  { id:"luxe", name:"Luxe Mercerized Polo", subtitle:"Subtle sheen. Zero itch.", baseUSD:95,
    colors:[{key:"emerald",label:"Emerald",hex:"#0f5132",img:"https://images.unsplash.com/photo-1520975682031-ae3b7b6a1d87?q=80&w=1200&auto=format&fit=crop"}],
    sizes:["S","M","L","XL"], badge:"New" }
];

function CartIcon({ count }:{count:number}){ return (<div className="relative"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M7 4h-2l-1 2v2h2l3.6 7.59L8 19a2 2 0 1 0 2 2h6a2 2 0 1 0 2-2H9.42l1-2H18a1 1 0 0 0 .92-.62l3-7A1 1 0 0 0 21 6H7V4z"/></svg>{count>0 && <span className="absolute -right-2 -top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">{count}</span>}</div>); }

export default function Storefront(){
  const [region] = useState(REGIONS[0]);
  const [cart,setCart] = useState<any[]>([]);
  const currency = region.currency as "USD"|"PLN"; const locale = region.locale;
  const subtotal = useMemo(()=>cart.reduce((s,i)=> s + priceInCurrency(i.baseUSD,currency)*i.qty,0),[cart,currency]);
  const shipping = subtotal>150?0:12; const vatRate = currency==="PLN"?0.23:0; const vat = subtotal*vatRate; const total = subtotal+shipping+vat;
  async function payStripe(){ const r = await fetch("/api/checkout/stripe",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({cart,currency})}); const {url}=await r.json(); location.href=url; }
  async function payPayU(){ const r = await fetch("/api/checkout/payu",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({cart})}); const {url}=await r.json(); location.href=url; }
  async function payP24(){ const r = await fetch("/api/checkout/p24",{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({cart})}); const {url}=await r.json(); location.href=url; }
  return (<div className="min-h-screen">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 ring-1 ring-white/10" /><div><h1 className="text-xl font-semibold tracking-wide">Caliki</h1><p className="text-xs text-white/60">Crafted Polos, Elevated Living</p></div></div>
        <button className="rounded-full p-2 hover:bg-white/10" aria-label="Open cart"><CartIcon count={cart.reduce((a,b)=>a+b.qty,0)} /></button>
      </div>
    </header>
    <section className="relative">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 md:grid-cols-2">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Caliki Exclusive</div>
        <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">Caliki polos that look rich,<br/>feel richer.</h2>
        <p className="mt-4 max-w-xl text-white/70">Ships across the US and Poland. USD/PLN, Stripe & PayU/Przelewy24 ready.</p></div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl"><img alt="Caliki polo" className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1520975682031-ae3b7b6a1d87?q=80&w=1600&auto=format&fit=crop"/></div>
      </div>
    </section>
    <section id="catalog" className="mx-auto max-w-7xl px-4 pb-24">
      <div className="mb-6 flex items-end justify-between"><div><h3 className="text-2xl font-semibold">Polos</h3><p className="text-sm text-white/60">Curated essentials</p></div><div className="text-sm text-white/60">EX rate: 1 USD ≈ {EX_RATE.toFixed(2)} PLN</div></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PRODUCTS.map(p=>{
          const converted = priceInCurrency(p.baseUSD,currency); const priceLabel = fmt(converted,currency,locale); const v = {color:p.colors[0].key,size:p.sizes[0],img:p.colors[0].img};
          return (<div key={p.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl ring-1 ring-white/10">
            <div className="relative aspect-[4/5] w-full overflow-hidden"><img alt={p.name} src={p.colors[0].img} className="h-full w-full object-cover"/></div>
            <div className="space-y-4 p-5"><div><h4 className="text-lg font-semibold">{p.name}</h4><p className="text-sm text-white/60">{p.subtitle}</p></div>
              <div className="flex items-center justify-between"><div/><div className="text-right"><div className="text-xl font-semibold text-amber-300">{priceLabel}</div><div className="text-[11px] text-white/50">incl. premium finish</div></div></div>
              <button onClick={()=>setCart(prev=>[...prev,{key:p.id,productId:p.id,name:p.name,baseUSD:p.baseUSD,color:v.color,size:v.size,img:v.img,qty:1}])} className="w-full rounded-xl bg-amber-400 px-4 py-2 font-medium text-black shadow hover:shadow-lg active:scale-[0.99]">Add to cart</button>
            </div></div>);
        })}
      </div>
      <div className="mt-8 grid gap-2 sm:grid-cols-3">
        <button onClick={payStripe} className="rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10">Checkout with Stripe (USD)</button>
        <button onClick={payPayU} className="rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10">Checkout with PayU (PLN)</button>
        <button onClick={payP24} className="rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10">Checkout with Przelewy24 (PLN)</button>
      </div>
      <div className="mt-4 text-sm text-white/60">Subtotal demo: {fmt(subtotal,currency,locale)} | Shipping: {shipping===0?'Free':fmt(shipping,currency,locale)} | VAT: {fmt(vat,currency,locale)} | Total: {fmt(total,currency,locale)}</div>
    </section>
  </div>);
}
