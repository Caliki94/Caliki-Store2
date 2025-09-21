import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const SND = process.env.PAYU_SANDBOX === "true";
const BASE = SND ? "https://secure.snd.payu.com" : "https://secure.payu.com";

async function getToken(){
  const data = new URLSearchParams({ grant_type:"client_credentials", client_id: process.env.PAYU_CLIENT_ID!, client_secret: process.env.PAYU_CLIENT_SECRET! });
  const r = await axios.post(`${BASE}/pl/standard/user/oauth/authorize`, data.toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return r.data.access_token as string;
}

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if (req.method!=="POST") return res.status(405).end();
  const { cart } = req.body as { cart: any[] };
  const token = await getToken();
  const rate = Number(process.env.NEXT_PUBLIC_EXCHANGE_RATE_PLN_PER_USD || 4);
  const totalGrosze = cart.reduce((s,i)=> s + Math.round(i.baseUSD*rate*100)*i.qty, 0);

  const body = {
    notifyUrl: `${process.env.NEXT_PUBLIC_URL}/api/checkout/payu/notify`,
    continueUrl: `${process.env.NEXT_PUBLIC_URL}/success`,
    customerIp: "127.0.0.1",
    merchantPosId: process.env.PAYU_POS_ID,
    description: "Caliki Polos",
    currencyCode: "PLN",
    totalAmount: String(totalGrosze),
    products: cart.map(i=>({ name: i.name, unitPrice: String(Math.round(i.baseUSD*rate*100)), quantity: i.qty })),
  };

  const r = await axios.post(`${BASE}/api/v2_1/orders`, body, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
  res.json({ url: r.data.redirectUri });
}
