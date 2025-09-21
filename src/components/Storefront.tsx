"use client";
import React, { useEffect, useMemo, useState } from "react";
import { priceInCurrency, fmt, EX_RATE } from "@/lib/currency";
import { classNames } from "@/lib/utils";

/* --- Regions & i18n --- */
const REGIONS = [
  { code: "US", name: "United States", currency: "USD", locale: "en-US" },
  { code: "PL", name: "Polska", currency: "PLN", locale: "pl-PL" },
] as const;

const T = {
  en: {
    exclusive: "Caliki Exclusive",
    heroA: "Caliki polos that look rich,",
    heroB: "feel richer.",
    heroP:
      "Premium fabrics, meticulous construction, and a silhouette that reads luxury from boardroom to boulevard. Ships across the US and Poland.",
    shop: "Shop Polos",
    changeRegion: "Change Region",
    rateLabel: "EX rate",
    catalogBlurb: "Curated essentials in three fabric stories",
    addToCart: "Add to cart",
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty. Add a polo to begin.",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    vat: "VAT (23%)",
    checkout: "Checkout",
    selectRegion: "Select your region",
    currency: "Currency",
    pay: "Pay",
    back: "Back",
    orderSummary: "Order Summary",
    demoNote:
      "Demo checkout: routes call /api/checkout for Stripe (USD) and PayU/Przelewy24 (PLN).",
    payMethod: "Payment method",
    stripeCard: "Stripe card (USD)",
    payu: "PayU (PLN)",
    p24: "Przelewy24 (PLN)",
  },
  pl: {
    exclusive: "Caliki Ekskluzywne",
    heroA: "Polówki Caliki wyglądają bogato,",
    heroB: "i tak się noszą.",
    heroP:
      "Premiumowe tkaniny, perfekcyjne wykończenie i sylwetka, która wygląda luksusowo od biura po bulwar. Wysyłka do USA i Polski.",
    shop: "Zobacz polówki",
    changeRegion: "Zmień region",
    rateLabel: "Kurs",
    catalogBlurb: "Wyselekcjonowane modele w trzech liniach",
    addToCart: "Dodaj do koszyka",
    yourCart: "Twój koszyk",
    emptyCart: "Koszyk jest pusty. Dodaj polówkę, aby zacząć.",
    subtotal: "Suma",
    shipping: "Dostawa",
    free: "Za darmo",
    vat: "VAT (23%)",
    checkout: "Do kasy",
    selectRegion: "Wybierz region",
    currency: "Waluta",
    pay: "Zapłać",
    back: "Wróć",
    orderSummary: "Podsumowanie zamówienia",
    demoNote:
      "Wersja demo: wywołujemy /api/checkout dla Stripe (USD) oraz PayU/Przelewy24 (PLN).",
    payMethod: "Metoda płatności",
    stripeCard: "Karta Stripe (USD)",
    payu: "PayU (PLN)",
    p24: "Przelewy24 (PLN)",
  },
} as const;

/* --- Demo products --- */
const PRODUCTS = [
  {
    id: "polo-classic",
    name: "Classic Piqué Polo",
    subtitle: "Staple. Breathable. Impeccable drape.",
    baseUSD: 69,
    colors: [
      {
        key: "navy",
        label: "Navy",
        hex: "#0a2342",
        img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
      },
      {
        key: "black",
        label: "Black",
        hex: "#0b0b0b",
        img: "https://images.unsplash.com/photo-1520975682031-ae3b7b6a1d87?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "Bestseller",
  },
  {
    id: "polo-luxe",
    name: "Luxe Mercerized Polo",
    subtitle: "Subtle sheen. Zero itch. Boardroom-ready.",
    baseUSD: 95,
    colors: [
      {
        key: "emerald",
        label: "Emerald",
        hex: "#0f5132",
        img: "https://images.unsplash.com/photo-1520975682031-ae3b7b6a1d87?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "New",
  },
  {
    id: "polo-elite",
    name: "Elite Cashmere Blend Polo",
    subtitle: "Sumptuous handfeel. Whisper-soft collar.",
    baseUSD: 149,
    colors: [
      {
        key: "oat",
        label: "Oat",
        hex: "#d8cdbf",
        img: "https://images.unsplash.com/photo-1467043153537-a4f2a746e0a3?q=80&w=1200&auto=format&fit=crop",
      },
    ],
    sizes: ["S", "M", "L"],
    badge: "Limited",
  },
];

/* --- Small UI helpers --- */
function CartIcon({ count }: { count: number }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M7 4h-2l-1 2v2h2l3.6 7.59L8 19a2 2 0 1 0 2 2h6a2 2 0 1 0 2-2H9.42l1-2H18a1 1 0 0 0 .92-.62l3-7A1 1 0 0 0 21 6H7V4z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">
          {count}
        </span>
      )}
    </div>
  );
}

/* ===================== MAIN ===================== */
export default function Storefront() {
  // region & language (simple detection, persisted in localStorage for the session)
  const [region, setRegion] = useState<typeof REGIONS[number]>(REGIONS[0]);
  const [lang, setLang] = useState<keyof typeof T>("en");
  const t = T[lang];

  useEffect(() => {
    try {
      const nv = navigator.language || "en-US";
      const r = nv.startsWith("pl") ? REGIONS[1] : REGIONS[0];
      setRegion(r);
      setLang(r.code === "PL" ? "pl" : "en");
    } catch {}
  }, []);

  // cart
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"stripe" | "payu" | "p24">("stripe");

  const currency = region.currency as "USD" | "PLN";
  const locale = region.locale;

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + priceInCurrency(i.baseUSD, currency) * i.qty, 0),
    [cart, currency]
  );
  const shipping = subtotal > 150 ? 0 : 12;
  const vatRate = currency === "PLN" ? 0.23 : 0;
  const vat = subtotal * vatRate;
  const total = subtotal + shipping + vat;

  async function payNow() {
    const headers = { "Content-Type": "application/json" };
    if (payMethod === "stripe") {
      const r = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers,
        body: JSON.stringify({ cart, currency }),
      });
      const { url } = await r.json();
      location.href = url;
    } else if (payMethod === "payu") {
      const r = await fetch("/api/checkout/payu", {
        method: "POST",
        headers,
        body: JSON.stringify({ cart }),
      });
      const { url } = await r.json();
      location.href = url;
    } else {
      const r = await fetch("/api/checkout/p24", {
        method: "POST",
        headers,
        body: JSON.stringify({ cart }),
      });
      const { url } = await r.json();
      location.href = url;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* rich background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0b0b0b] to-[#1a1205]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1552374196-1ab2a1c59330?q=80&w=1600&auto=format&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,215,128,0.10),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(255,215,0,0.10),transparent_40%)]" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 ring-1 ring-white/10" />
            <div>
              <h1 className="text-xl font-semibold tracking-wide">Caliki</h1>
              <p className="text-xs text-white/60">Crafted Polos, Elevated Living</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
              <button
                onClick={() => setLang("en")}
                className={classNames(
                  "rounded px-2 py-0.5",
                  lang === "en" ? "bg-amber-400 text-black" : "text-white/80 hover:bg-white/10"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLang("pl")}
                className={classNames(
                  "rounded px-2 py-0.5",
                  lang === "pl" ? "bg-amber-400 text-black" : "text-white/80 hover:bg-white/10"
                )}
              >
                PL
              </button>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="rounded-full p-2 hover:bg-white/10"
              aria-label="Open cart"
            >
              <CartIcon count={cart.reduce((a, b) => a + b.qty, 0)} />
            </button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> {t.exclusive}
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              {t.heroA}
              <br />
              {t.heroB}
            </h2>
            <p className="mt-4 max-w-xl text-white/70">{t.heroP}</p>
            <a
              href="#catalog"
              className="mt-6 inline-block rounded-xl bg-amber-400 px-5 py-2.5 font-medium text-black shadow hover:shadow-lg active:scale-[0.99]"
            >
              {t.shop}
            </a>
            <p className="mt-3 text-xs text-white/50">
              VAT & duties calculated at checkout. Free returns within 30 days.
            </p>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
            <img
              alt="Caliki polo"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1520975682031-ae3b7b6a1d87?q=80&w=1600&auto=format&fit=crop"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/20" />
          </div>
        </div>
      </section>

      {/* catalog */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Polos</h3>
            <p className="text-sm text-white/60">{t.catalogBlurb}</p>
          </div>
          <div className="text-sm text-white/60">
            {t.rateLabel}: 1 USD ≈ {EX_RATE.toFixed(2)} PLN
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              currency={currency}
              locale={locale}
              onAdd={(prod, variant) =>
                setCart((prev) => {
                  const key = `${prod.id}-${variant.color}-${variant.size}`;
                  const f = prev.find((x) => x.key === key);
                  if (f) return prev.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x));
                  return [
                    ...prev,
                    {
                      key,
                      productId: prod.id,
                      name: prod.name,
                      baseUSD: prod.baseUSD,
                      color: variant.color,
                      size: variant.size,
                      img: variant.img,
                      qty: 1,
                    },
                  ];
                })
              }
            />
          ))}
        </div>
      </section>

      <Footer />

      {/* CART */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          currency={currency}
          locale={locale}
          t={t}
          onClose={() => setCartOpen(false)}
          onRemove={(k) => setCart((c) => c.filter((x) => x.key !== k))}
          onQty={(k, q) =>
            setCart((c) => c.map((x) => (x.key === k ? { ...x, qty: Math.max(1, q) } : x)))
          }
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
            setPayMethod(region.code === "PL" ? "payu" : "stripe");
          }}
        />
      )}

      {/* CHECKOUT */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          currency={currency}
          locale={locale}
          t={t}
          payMethod={payMethod}
          setPayMethod={setPayMethod}
          onClose={() => setCheckoutOpen(false)}
          onPay={payNow}
        />
      )}
    </div>
  );
}

/* --- Product Card --- */
function ProductCard({
  product,
  currency,
  locale,
  onAdd,
}: {
  product: any;
  currency: "USD" | "PLN";
  locale: string;
  onAdd: (product: any, variant: any) => void;
}) {
  const [color, setColor] = useState(product.colors[0].key);
  const [size, setSize] = useState(product.sizes[0]);
  const cobj = product.colors.find((c: any) => c.key === color) || product.colors[0];

  const converted = priceInCurrency(product.baseUSD, currency);
  const priceLabel = fmt(converted, currency, locale);

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl ring-1 ring-white/10">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          alt={product.name}
          src={cobj.img}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-black shadow">
            {product.badge}
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h4 className="text-lg font-semibold">{product.name}</h4>
          <p className="text-sm text-white/60">{product.subtitle}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.colors.map((c: any) => (
              <button
                key={c.key}
                onClick={() => setColor(c.key)}
                className={classNames(
                  "h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-black",
                  color === c.key ? "ring-amber-300" : "ring-transparent"
                )}
                style={{ backgroundColor: c.hex }}
                aria-label={`Color ${c.label}`}
              />
            ))}
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-amber-300">{priceLabel}</div>
            <div className="text-[11px] text-white/50">incl. premium finish</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product.sizes.map((s: string) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={classNames(
                "rounded-xl border px-3 py-1 text-sm",
                s === size
                  ? "border-amber-300 bg-amber-300/10 text-amber-200"
                  : "border-white/20 text-white/80 hover:bg-white/10"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            onAdd(product, { color, size, img: cobj.img })
          }
          className="w-full rounded-xl bg-amber-400 px-4 py-2 font-medium text-black shadow hover:shadow-lg active:scale-[0.99]"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

/* --- Cart Drawer --- */
function CartDrawer({
  cart,
  currency,
  locale,
  t,
  onClose,
  onRemove,
  onQty,
  onCheckout,
}: {
  cart: any[];
  currency: "USD" | "PLN";
  locale: string;
  t: any;
  onClose: () => void;
  onRemove: (key: string) => void;
  onQty: (key: string, qty: number) => void;
  onCheckout: () => void;
}) {
  const subtotal = cart.reduce((s, i) => s + priceInCurrency(i.baseUSD, currency) * i.qty, 0);
  const shipping = subtotal > 150 ? 0 : 12;
  const vatRate = currency === "PLN" ? 0.23 : 0;
  const vat = subtotal * vatRate;
  const total = subtotal + shipping + vat;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-black p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{t.yourCart}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-white/60">{t.emptyCart}</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => {
              const unit = priceInCurrency(item.baseUSD, currency);
              return (
                <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-white/10 p-3">
                  <img src={item.img} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-white/60">{(item.color || "").toUpperCase()} · {item.size}</div>
                    <div className="mt-1 text-sm text-amber-300">{fmt(unit, currency, locale)}</div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <label className="text-white/60">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => onQty(item.key, parseInt(e.target.value || "1", 10))}
                        className="w-16 rounded-lg border border-white/20 bg-black px-2 py-1"
                      />
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.key)} className="text-sm text-white/60 hover:text-white">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Row label={t.subtotal} value={fmt(subtotal, currency, locale)} />
            <Row label={t.shipping} value={shipping === 0 ? t.free : fmt(shipping, currency, locale)} />
            {vatRate > 0 && <Row label={t.vat} value={fmt(vat, currency, locale)} />}
            <button
              onClick={onCheckout}
              className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-2 font-medium text-black shadow hover:shadow-lg"
            >
              {t.checkout}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* --- Checkout modal --- */
function CheckoutModal({
  cart,
  currency,
  locale,
  t,
  payMethod,
  setPayMethod,
  onClose,
  onPay,
}: {
  cart: any[];
  currency: "USD" | "PLN";
  locale: string;
  t: any;
  payMethod: "stripe" | "payu" | "p24";
  setPayMethod: (m: "stripe" | "payu" | "p24") => void;
  onClose: () => void;
  onPay: () => void;
}) {
  const subtotal = cart.reduce((s, i) => s + priceInCurrency(i.baseUSD, currency) * i.qty, 0);
  const shipping = subtotal > 150 ? 0 : 12;
  const vatRate = currency === "PLN" ? 0.23 : 0;
  const vat = subtotal * vatRate;
  const total = subtotal + shipping + vat;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r">
            <h3 className="text-lg font-semibold">{t.orderSummary}</h3>
            <div className="mt-3 max-h-56 space-y-3 overflow-auto pr-2">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-white/10 p-3">
                  <img src={item.img} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-white/60">
                      {(item.color || "").toUpperCase()} · {item.size} × {item.qty}
                    </div>
                  </div>
                  <div className="text-sm text-amber-300">
                    {fmt(priceInCurrency(item.baseUSD, currency) * item.qty, currency, locale)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Row label={t.subtotal} value={fmt(subtotal, currency, locale)} />
              <Row label={t.shipping} value={shipping === 0 ? t.free : fmt(shipping, currency, locale)} />
              {vatRate > 0 && <Row label={t.vat} value={fmt(vat, currency, locale)} />}
              <div className="mt-3 border-t border-white/10 pt-3 text-lg font-semibold text-amber-300">
                {fmt(total, currency, locale)}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold">{t.payMethod}</h3>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <button
                onClick={() => setPayMethod("stripe")}
                className={classNames(
                  "rounded-xl border px-3 py-2",
                  payMethod === "stripe" ? "border-amber-300 bg-amber-300/10" : "border-white/20 hover:bg-white/10"
                )}
              >
                {t.stripeCard}
              </button>
              <button
                onClick={() => setPayMethod("payu")}
                className={classNames(
                  "rounded-xl border px-3 py-2",
                  payMethod === "payu" ? "border-amber-300 bg-amber-300/10" : "border-white/20 hover:bg-white/10"
                )}
              >
                {t.payu}
              </button>
              <button
                onClick={() => setPayMethod("p24")}
                className={classNames(
                  "rounded-xl border px-3 py-2",
                  payMethod === "p24" ? "border-amber-300 bg-amber-300/10" : "border-white/20 hover:bg-white/10"
                )}
              >
                {t.p24}
              </button>
            </div>

            <button
              onClick={onPay}
              className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-2 font-medium text-black shadow hover:shadow-lg"
            >
              {t.pay} {/* amount is also visible above */}
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10"
            >
              {t.back}
            </button>
            <p className="mt-3 text-xs text-white/60">{t.demoNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Small row element & footer --- */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="text-lg font-semibold">Caliki</div>
          <p className="mt-2 text-sm text-white/60">Crafted Polos, Elevated Living.</p>
        </div>
        <div>
          <div className="text-sm font-semibold text-white/80">Customer</div>
          <ul className="mt-2 space-y-1 text-sm text-white/60">
            <li>Shipping & Returns</li>
            <li>Care Guide</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white/80">Legal</div>
          <ul className="mt-2 space-y-1 text-sm text-white/60">
            <li>Terms</li>
            <li>Privacy</li>
            <li>Cookies</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white/80">Newsletter</div>
          <div className="mt-2 flex gap-2">
            <input placeholder="Your email" className="flex-1 rounded-xl border border-white/20 bg-black px-3 py-2 text-sm" />
            <button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-black">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Caliki. All rights reserved.
      </div>
    </footer>
  );
}
