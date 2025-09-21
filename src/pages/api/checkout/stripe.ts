import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// ✅ Use the default API version (let Stripe pick it)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { cart, currency } = req.body as { cart: any[]; currency: "USD" | "PLN" };
  if (currency !== "USD") return res.status(400).json({ error: "Stripe route only supports USD" });

  const line_items = cart.map((i) => ({
    price_data: {
      currency: "usd",
      product_data: { name: i.name },
      unit_amount: Math.round(i.baseUSD * 100),
    },
    quantity: i.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  });

  return res.json({ url: session.url });
}
